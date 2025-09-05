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
      const { data: workspace_members, error: memberError } = await supabase
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
  if (!trimmedCodespaceId) throw new Error('Codespace ID is required');
  if (!email || !email.trim()) throw new Error('Email is required');
  if (!userid) throw new Error('User ID is required');
  

  try {
    // Verify codespace exists
    const { data: codespace } = await supabase
      .from('workspaces') 
      .select('id')
      .eq('id', trimmedCodespaceId)
      .single();
    if (!codespace) throw new Error('Workspace not found');

    // Verify user exists
    const { data: user } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userid)
      .single();
    if (!user) throw new Error('User not found');

    // Check for existing invitation
    const { data: existing } = await supabase
      .from('invitations')
      .select('id')
      .eq('workspace_id', trimmedCodespaceId)
      .eq('email', email)
      .single();
    if (existing) throw new Error('Invitation already exists');

    // Insert invitation
    const { data: invitation, error: insertError } = await supabase
      .from('invitations')
      .insert([{
        workspace_id: trimmedCodespaceId,
        email: email,
        role: role, 
        invited_by: userid,
        accepted_at: null,
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      throw new Error(`Failed to insert invitation: ${insertError.message}`);
    }

    // Configure SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: from,
        pass:key,
      },
    });

    // Construct share link using codespaceId
    const shareLink = `http://localhost:5173/codespace/sharebyemail/${invitation.id}`;

    // Compose email
    const mailOptions = {
      from: '"Realtime Code Editor" <m.mannage@gmail.com>',
      to: email,
      subject: 'A Codespace Has Been Shared With You',
      html: `
         <html>
    <body style="font-family: Arial, sans-serif; background: #0f172a; padding: 40px; color: #f1f5f9; margin: 0;">
      <div style="max-width: 600px; margin: auto; background: #1e293b; padding: 28px; border-radius: 10px; border: 1px solid #334155;">
        
        <h2 style="color: #f1f5f9; font-size: 22px; font-weight: bold; margin-bottom: 20px; text-align: center;">
          You've been invited to a Codespace
        </h2>
        
        <p style="font-size: 15px; color: #cbd5e1;">Hi ${email.split('@')[0]},</p>
        
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

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`Codespace sharing email sent to ${email} successfully.`);

    return { invitation };
  } catch (err) {
    console.error('Error in shareCodespaceByEmail:', err);
    throw err;
  }
}

static async acceptInvitation(invitationId) {
  try {
    // Fetch invitation
    const { data: invitation, error: fetchError } = await supabase
      .from('invitations')
      .select('*')
      .eq('id', invitationId)
      .single();
    if (fetchError || !invitation) {
      throw new Error('Invitation not found');
    }

    // Fetch user_id from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', invitation.email.trim())
      .single();
    if (profileError || !profile) {
      throw new Error('User profile not found');
    }

    // Update accepted_at
    const { data: updatedInvitation, error: updateError } = await supabase
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('id', invitationId)
      .select()
      .single();
    if (updateError) {
      console.error('Supabase update error:', updateError);
      throw new Error(`Failed to accept invitation: ${updateError.message}`);
    }

   
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', invitation.workspace_id)
      .eq('user_id', profile.id)
      .single();
    if (existingMember) {
      throw new Error('User is already a member of this workspace');
    }

    // Add user to workspace_members
    const { data: member, error: memberError } = await supabase
      .from('workspace_members')
      .insert([{
        workspace_id: invitation.workspace_id,
        user_id: profile.id,
        role: invitation.role, // Role from invitation, trigger may override to 'admin'
        joined_at: new Date().toISOString(),
      }])
      .select()
      .single();
    if (memberError) {
      console.error('Supabase insert error:', memberError);
      throw new Error(`Failed to add user to workspace: ${memberError.message}`);
    }

    return { invitation: updatedInvitation, member };
  } catch (err) {
    console.error('Error in acceptInvitation:', err);
    throw err;
  }
}  
}
