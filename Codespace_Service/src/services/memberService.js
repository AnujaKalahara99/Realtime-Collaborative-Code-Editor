import { supabase } from "./supabaseClient.js";

export class MemberService {
  static async getCodespaceMembers(codespaceId, userId) {
    // Check if user is member of codespace
    await CodespaceService.checkUserPermission(codespaceId, userId);

    const { data, error } = await supabase
      .from("workspace_members")
      .select(
        `
        user_id,
        role,
        joined_at,
        profiles(email, name)
      `
      )
      .eq("workspace_id", codespaceId);

    if (error) throw error;

    return data.map((member) => ({
      userId: member.user_id,
      email: member.profiles?.email,
      name: member.profiles?.name,
      role: member.role,
      joinedAt: new Date(member.joined_at).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));
  }

  static async addMemberToCodespace(codespaceId, userEmail, role, adminUserId) {
    // Check if admin has permission
    await CodespaceService.checkUserPermission(codespaceId, adminUserId, [
      "admin",
      "owner",
    ]);

    // Find user by email
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    if (userError || !userData) {
      const notFoundError = new Error("User not found");
      notFoundError.statusCode = 404;
      notFoundError.code = "USER_NOT_FOUND";
      throw notFoundError;
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("workspace_member s")
      .select("user_id")
      .eq("workspace_id", codespaceId)
      .eq("user_id", userData.id)
      .single();

    if (existingMember) {
      const conflictError = new Error(
        "User is already a member of this codespace"
      );
      conflictError.statusCode = 409;
      conflictError.code = "USER_ALREADY_MEMBER";
      throw conflictError;
    }

    // Add member
    const { error } = await supabase.from("workspace_members").insert({
      workspace_id: codespaceId,
      user_id: userData.id,
      role: role || "member",
      joined_at: new Date().toISOString(),
    });

    if (error) throw error;
    return true;
  }

  static async removeMemberFromCodespace(
    codespaceId,
    memberUserId,
    adminUserId
  ) {
    // Check if admin has permission
    await CodespaceService.checkUserPermission(codespaceId, adminUserId, [
      "admin",
      "owner",
    ]);

    // Don't allow removing the last admin
    const { data: adminCount } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", codespaceId)
      .in("role", ["admin", "owner"]);

    if (
      adminCount &&
      adminCount.length === 1 &&
      adminCount[0].user_id === memberUserId
    ) {
      const conflictError = new Error(
        "Cannot remove the last admin from codespace"
      );
      conflictError.statusCode = 409;
      conflictError.code = "CANNOT_REMOVE_LAST_ADMIN";
      throw conflictError;
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", codespaceId)
      .eq("user_id", memberUserId);

    if (error) throw error;
    return true;
  }
}
