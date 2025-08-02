import { MemberService } from "../services/memberService.js";
import { CodespaceService } from "../services/codespaceService.js";

export class MemberController {
  static async getCodespaceMembers(req, res, next) {
    try {
      const { id } = req.params;

      const members = await MemberService.getCodespaceMembers(id, req.user.id);

      res.json({
        members,
        count: members.length,
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }
      next(error);
    }
  }

  static async addMember(req, res, next) {
    try {
      const { id } = req.params;
      const { email, role = "member" } = req.body;

      if (!email?.trim()) {
        return res.status(400).json({
          error: "User email is required",
          code: "MISSING_EMAIL",
        });
      }

      if (!["member", "admin"].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role. Must be "member" or "admin"',
          code: "INVALID_ROLE",
        });
      }

      await MemberService.addMemberToCodespace(
        id,
        email.trim(),
        role,
        req.user.id
      );

      res.status(201).json({
        message: "Member added successfully",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }
      next(error);
    }
  }

  static async removeMember(req, res, next) {
    try {
      const { id, userId } = req.params;

      await MemberService.removeMemberFromCodespace(id, userId, req.user.id);

      res.json({
        message: "Member removed successfully",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }
      next(error);
    }
  }

  static async updateMemberRole(req, res, next) {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      if (!["member", "admin"].includes(role)) {
        return res.status(400).json({
          error: 'Invalid role. Must be "member" or "admin"',
          code: "INVALID_ROLE",
        });
      }

      // Check admin permissions
      await CodespaceService.checkUserPermission(id, req.user.id, [
        "admin",
        "owner",
      ]);

      const { error } = await supabase
        .from("workspace_members")
        .update({ role })
        .eq("workspace_id", id)
        .eq("user_id", userId);

      if (error) throw error;

      res.json({
        message: "Member role updated successfully",
      });
    } catch (error) {
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code,
        });
      }
      next(error);
    }
  }
}
