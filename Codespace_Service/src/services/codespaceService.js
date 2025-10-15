import { supabase } from "./supabaseClient.js";
import nodemailer from "nodemailer";
const from = process.env.Email_user;
const key = process.env.Email_password;
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
      role: workspace.workspace_members[0]?.role,
    }));
  }

  static async getCodespaceDetails(userId, codespaceId) {
    const { data, error } = await supabase.rpc("get_codespace_details", {
      p_user_id: userId,
      p_workspace_id: codespaceId,
    });

    if (error) throw error;

    const row = data[0];

    return {
      id: row.id,
      name: row.name,
      lastModified: row.created_at,
      created_at: row.created_at,
      role: row.role,
      owner: row.owner,
      gitHubRepo: row.githubrepo,
      sessions: row.sessions,
    };
  }

  static async createCodespace(name, userId) {
    const { data, error } = await supabase.rpc("create_codespace", {
      p_workspace_name: name,
      p_user_id: userId,
    });

    if (error) throw error;

    const row = data[0];

    return {
      id: row.workspace_id,
      name: row.workspace_name,
      lastModified: row.workspace_created_at,
      role: row.role,
      repoId: row.repo_id,
      branchId: row.branch_id,
      sessionId: row.session_id,
    };
  }

  static async updateCodespace(codespaceId, name, userId) {
    await this.checkUserPermission(codespaceId, userId, ["admin", "owner"]);

    const { data, error } = await supabase
      .from("workspaces")
      .update({
        name,
        // updated_at: new Date().toISOString(),
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

  static async createBranchWithSession(codespaceId, branchName, userId) {
    // await this.checkUserPermission(codespaceId, userId, ["admin", "owner", "Developer"]);

    try {
      const { data, error } = await supabase.rpc("create_branch_with_session", {
        p_workspace_id: codespaceId,
        p_branch_name: branchName,
      });

      if (error) {
        throw new Error(`Failed to create branch: ${error.message}`);
      }

      return data;
    } catch (err) {
      console.error("Error in createBranchWithSession:", err);

      if (err.message.includes("already exists")) {
        const duplicateError = new Error(
          `Branch "${branchName}" already exists in this workspace`
        );
        duplicateError.statusCode = 409;
        duplicateError.code = "BRANCH_ALREADY_EXISTS";
        throw duplicateError;
      }

      if (err.message.includes("Workspace not found")) {
        const notFoundError = new Error("Workspace not found");
        notFoundError.statusCode = 404;
        notFoundError.code = "WORKSPACE_NOT_FOUND";
        throw notFoundError;
      }

      const serviceError = new Error(
        `Failed to create branch with session: ${err.message}`
      );
      serviceError.statusCode = err.statusCode || 500;
      serviceError.code = err.code || "BRANCH_CREATION_FAILED";
      throw serviceError;
    }
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

  static async shareCodespaceByEmail(codespaceId, email, userid, role) {
    const trimmedCodespaceId = codespaceId.trim();
    if (!trimmedCodespaceId) throw new Error("Codespace ID is required");
    if (!email || !email.trim()) throw new Error("Email is required");
    if (!userid) throw new Error("User ID is required");

    try {
      // Verify codespace exists
      const { data: codespace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("id", trimmedCodespaceId)
        .single();
      if (!codespace) throw new Error("Workspace not found");

      // Verify user exists
      const { data: user } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userid)
        .single();
      if (!user) throw new Error("User not found");

      // Check for existing invitation
      const { data: existing } = await supabase
        .from("invitations")
        .select("id")
        .eq("workspace_id", trimmedCodespaceId)
        .eq("email", email)
        .single();
      if (existing) throw new Error("Invitation already exists");

      // Insert invitation
      const { data: invitation, error: insertError } = await supabase
        .from("invitations")
        .insert([
          {
            workspace_id: trimmedCodespaceId,
            email: email,
            role: role,
            invited_by: userid,
            accepted_at: null,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error("Supabase insert error:", insertError);
        throw new Error(`Failed to insert invitation: ${insertError.message}`);
      }

      // Configure SMTP transport
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: from,
          pass: key,
        },
      });

      // Construct share link using codespaceId
      // const shareLink = `http://localhost:5173/codespace/sharebyemail/${invitation.id}`;
      const shareLink = `https://rtc-editor.netlify.app/codespace/sharebyemail/${invitation.id}`;
      // const shareLink = `https://68aee7a468a50f41d684ab8b--rtc-editor.netlify.app/codespace/sharebyemail/${invitation.id}`;

      // Compose email
      const mailOptions = {
        from: '"Realtime Code Editor" <m.mannage@gmail.com>',
        to: email,
        subject: "A Codespace Has Been Shared With You",
        html: `
         <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; padding: 40px; color: #f1f5f9; margin: 0;">
      <div style="max-width: 600px; margin: auto; background: #1e293b; padding: 28px; border-radius: 10px; border: 1px solid #334155;">
        
        <h2 style="color: #f1f5f9; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">
          You've been invited to a Codespace
        </h2>
        
        <p style="font-size: 15px; color: #cbd5e1;">Hi ${
          email.split("@")[0]
        },</p>
        
        <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">
          You've been invited to collaborate on a codespace as a 
          <strong style="color: #60a5fa;">${role}</strong>.
        </p>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${shareLink}" 
             style="background: #2563eb; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">
             Join Codespace
          </a>
        </div>

        <p style="font-size: 13px; color: #94a3b8;">If you can’t click the button, copy this link:</p>
        <p style="font-size: 13px; color: #60a5fa; word-break: break-all;">${shareLink}</p>

        <p style="font-size: 12px; color: #64748b; margin-top: 20px; text-align: center;">
          This invitation expires in 7 days.
        </p>
      </div>
    </body>
  </html>
      
      `,
      };

      await transporter.sendMail(mailOptions);

      return { invitation };
    } catch (err) {
      console.error("Error in shareCodespaceByEmail:", err);
      throw err;
    }
  }

  static async acceptInvitation(invitationId) {
    try {
      // Fetch invitation
      const { data: invitation, error: fetchError } = await supabase
        .from("invitations")
        .select("*")
        .eq("id", invitationId)
        .single();
      if (fetchError || !invitation) {
        throw new Error("Invitation not found");
      }

      // Fetch user_id from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", invitation.email.trim())
        .single();
      if (profileError || !profile) {
        throw new Error("User profile not found");
      }

      // Update accepted_at
      const { data: updatedInvitation, error: updateError } = await supabase
        .from("invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", invitationId)
        .select()
        .single();
      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw new Error(`Failed to accept invitation: ${updateError.message}`);
      }

      const { data: existingMember } = await supabase
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", invitation.workspace_id)
        .eq("user_id", profile.id)
        .single();
      if (existingMember) {
        throw new Error("User is already a member of this workspace");
      }

      // Add user to workspace_members
      const { data: member, error: memberError } = await supabase
        .from("workspace_members")
        .insert([
          {
            workspace_id: invitation.workspace_id,
            user_id: profile.id,
            role: invitation.role, // Role from invitation, trigger may override to 'admin'
            joined_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();
      if (memberError) {
        console.error("Supabase insert error:", memberError);
        throw new Error(
          `Failed to add user to workspace: ${memberError.message}`
        );
      }

      return { invitation: updatedInvitation, member };
    } catch (err) {
      console.error("Error in acceptInvitation:", err);
      throw err;
    }
  }

  static async updateGitHubDetails(
    codespaceId,
    userId,
    githubRepo,
    githubAccessToken
  ) {
    // Check permissions first - only allow admin or owner to update GitHub details
    await this.checkUserPermission(codespaceId, userId, ["admin", "owner"]);

    try {
      // Update the workspaces table with GitHub details
      const { data, error } = await supabase
        .from("workspaces")
        .update({
          github_repo: githubRepo,
          github_access_token: githubAccessToken,
        })
        .eq("id", codespaceId)
        .select("id, name, created_at, github_repo")
        .single();

      if (error) {
        console.error("Error updating GitHub details:", error);
        const updateError = new Error(
          `Failed to update GitHub details: ${error.message}`
        );
        updateError.statusCode = 500;
        updateError.code = "UPDATE_GITHUB_FAILED";
        throw updateError;
      }

      return {
        id: data.id,
        name: data.name,
        lastModified: new Date(data.created_at).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        githubRepo: data.github_repo,
      };
    } catch (err) {
      console.error("Error in updateGitHubDetails:", err);

      // Re-throw the error if it's already structured
      if (err.statusCode && err.code) {
        throw err;
      }

      // Otherwise create a structured error
      const serviceError = new Error(
        `Failed to update GitHub details: ${err.message}`
      );
      serviceError.statusCode = 500;
      serviceError.code = "GITHUB_UPDATE_FAILED";
      throw serviceError;
    }
  }
}
