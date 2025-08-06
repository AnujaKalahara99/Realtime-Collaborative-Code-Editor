import { supabase } from "./supabaseClient.js";
import nodemailer from "nodemailer";
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

 static async shareCodespace(codespaceId, email) {
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email.trim())
    .single();

  if (userError || !userData) {
    console.error("Error finding user by email:", userError?.message || "User not found");
    throw new Error("User not found");
  }

  const targetUserId = userData.id;

  // Optionally: prevent duplicate insert
  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("workspace_id", codespaceId)
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (existingMember) {
    throw new Error("User is already a member of the codespace");
  }

  const { error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: codespaceId,
      user_id: targetUserId,
      role: "Developer",
      joined_at: new Date().toISOString(),
    });

  if (error) {
    console.error("Error inserting into workspace_members:", error.message);
    throw error;
  }

  return true;
}


static async shareCodespaceByEmail(codespaceId, email, userid, role) {
  const trimmedCodespaceId = codespaceId.trim();
  if (!trimmedCodespaceId) throw new Error('Codespace ID is required');
  if (!email || !email.trim()) throw new Error('Email is required');
  if (!userid) throw new Error('User ID is required');
  

  try {
    // Verify codespace exists
    const { data: codespace } = await supabase
      .from('workspaces') // Assuming 'workspaces' is the table (previously 'codespaces')
      .select('id')
      .eq('id', trimmedCodespaceId)
      .single();
    if (!codespace) throw new Error('Workspace not found');

    // Verify user exists
    const { data: user } = await supabase
      .from('profiles') // Assuming 'profiles' table for users
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
        user: 'm.mannage@gmail.com',
        pass: 'ncycclsukyshyywm',
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
          <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f9; color: #333;">
            <div style="max-width: 600px; margin: 20px auto; padding: 20px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <h2 style="text-align: center; color: #333;">You've Been Invited to a Codespace</h2>
              <p style="font-size: 16px; color: #555;">Hi there,</p>
              <p style="font-size: 16px; color: #555;">You’ve been invited to collaborate on a codespace as a ${role}. Click the link below to access it:</p>
              <div style="text-align: center; margin-top: 20px;">
                <a href="${shareLink}" style="background-color: #4CAF50; color: white; padding: 12px 20px; font-size: 16px; text-decoration: none; border-radius: 5px; display: inline-block;">Open Codespace</a>
              </div>
              <p style="font-size: 14px; color: #777; text-align: center; margin-top: 30px;">If you weren’t expecting this, you can ignore this email.</p>
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
