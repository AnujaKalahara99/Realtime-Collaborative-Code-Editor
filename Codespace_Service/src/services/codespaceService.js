import { supabase } from "./supabaseClient.js";

export class CodespaceService {
  static async getUserCodespaces(userId) {
    const { data, error } = await supabase
      .from("workspaces")
      .select(
        `
        id,
        name,
        created_at,
        workspace_members!inner(user_id, role)
      `
      )
      .eq("workspace_members.user_id", userId);

    if (error) throw error;

    return data.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      lastModified: new Date(
        workspace.updated_at || workspace.created_at
      ).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      role: workspace.workspace_members[0]?.role || "member",
    }));
  }

  static async createCodespace(name, userId) {
    // Start transaction-like operations
    const { data: workspaceData, error: workspaceError } = await supabase
      .from("workspaces")
      .insert({
        name,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (workspaceError) throw workspaceError;

    try {
      const { error: memberError } = await supabase
        .from("workspace_members")
        .insert({
          workspace_id: workspaceData.id,
          user_id: userId,
          role: "owner",
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        // Cleanup: Delete the workspace if member creation fails
        await supabase.from("workspaces").delete().eq("id", workspaceData.id);
        throw memberError;
      }

      return {
        id: workspaceData.id,
        name: workspaceData.name,
        lastModified: new Date().toISOString(),
        role: "owner",
      };
    } catch (error) {
      // Ensure cleanup on any error
      await supabase.from("workspaces").delete().eq("id", workspaceData.id);
      throw error;
    }
  }

  static async updateCodespace(codespaceId, name, userId) {
    // Check permissions first
    await this.checkUserPermission(codespaceId, userId, ["admin", "owner"]);

    const { data, error } = await supabase
      .from("workspaces")
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", codespaceId)
      .select()
      .single();

    if (error) throw error;

    const memberData = await this.getUserCodespaceMembership(
      codespaceId,
      userId
    );

    return {
      id: data.id,
      name: data.name,
      lastModified: new Date(data.updated_at || data.created_at).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ),
      role: memberData.role,
    };
  }

  static async deleteCodespace(codespaceId, userId) {
    // Check permissions first
    await this.checkUserPermission(codespaceId, userId, ["admin", "owner"]);

    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", codespaceId);

    if (error) throw error;
    return true;
  }

  static async checkUserPermission(codespaceId, userId, allowedRoles = []) {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", codespaceId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      const notFoundError = new Error("Codespace not found or access denied");
      notFoundError.statusCode = 404;
      notFoundError.code = "CODESPACE_NOT_FOUND";
      throw notFoundError;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(data.role)) {
      const permissionError = new Error("Insufficient permissions");
      permissionError.statusCode = 403;
      permissionError.code = "INSUFFICIENT_PERMISSIONS";
      throw permissionError;
    }

    return data;
  }

  static async getUserCodespaceMembership(codespaceId, userId) {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", codespaceId)
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      const notFoundError = new Error("Codespace membership not found");
      notFoundError.statusCode = 404;
      notFoundError.code = "MEMBERSHIP_NOT_FOUND";
      throw notFoundError;
    }

    return data;
  }
}
