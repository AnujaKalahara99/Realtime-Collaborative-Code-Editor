import { CodespaceService } from "../services/codespaceService.js";

export class CodespaceController {
  static async getCodespaces(req, res, next) {
    // console.log("Fetching codespaces for user:", req.user.id);

    try {
      const codespaces = await CodespaceService.getUserCodespaces(req.user.id);
      res.json({
        codespaces,
        count: codespaces.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getallinvitedusers(req, res, next) {
    try {
      const { id } = req.params;
      const invitedUsers = await CodespaceService.getAllInvitedUsers(id);
      res.json({
        invitedUsers,
        count: invitedUsers.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req, res, next) {
    try {
      const { codespaceId, email } = req.params;
      await CodespaceService.removeMember(codespaceId, email);

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

  static async createCodespace(req, res, next) {
    try {
      const { name } = req.body;
      const codespace = await CodespaceService.createCodespace(
        name,
        req.user.id
      );

      res.status(201).json({
        codespace,
        message: "Codespace created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCodespace(req, res, next) {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const codespace = await CodespaceService.updateCodespace(
        id,
        name,
        req.user.id
      );

      res.json({
        codespace,
        message: "Codespace updated successfully",
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

  static async deleteCodespace(req, res, next) {
    try {
      const { id } = req.params;

      await CodespaceService.deleteCodespace(id, req.user.id);

      res.json({
        message: "Codespace deleted successfully",
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
  static async shareCodespaceByEmail(req, res, next) {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      if (
        !email ||
        !email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      const result = await CodespaceService.shareCodespaceByEmail(
        id,
        email,
        req.user.id,
        role
      );

      res.json({
        message: "Invitation sent successfully",
        invitation: result.invitation,
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

  static async getCodespaceById(req, res, next) {
    try {
      console.log("Fetching codespace details for user:", req.user.id, "and workspace:", req.params.id);
      const codespace = await CodespaceService.getCodespaceDetails(
        req.user.id,
        req.params.id
      );
      console.log("Fetched codespace details:", codespace);
      res.json({
        codespace,
      });
    } catch (error) {
      console.error("Error in getCodespaceById:", error);
      if (error.statusCode) {
        return res.status(error.statusCode).json({
          error: error.message,
          code: error.code || "UNKNOWN_ERROR",
        });
      }
      next(error);
    }
  }

  static async shareCodespace(req, res, next) {
    try {
      const { id } = req.params;
      const { email } = req.body;

      // Validate email format
      if (
        !email ||
        !email.trim() ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ) {
        return res.status(400).json({
          error: "Invalid email format",
          code: "INVALID_EMAIL",
        });
      }

      await CodespaceService.shareCodespace(id, email);

      res.json({
        message: "Codespace shared successfully",
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

  static async acceptInvitation(req, res, next) {
    try {
      const { invitationId } = req.params;

      const result = await CodespaceService.acceptInvitation(invitationId);

      res.json({
        message: "Invitation accepted successfully",
        invitation: result.invitation,
        member: result.member,
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

  static async acceptInvitationEmail(req, res, next) {
    try {
      const { invitationId } = req.params;

      const result = await CodespaceService.acceptInvitationEmail(invitationId);

      res.json({
        email: result.email,
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

  static async createSession(req, res, next) {
    try {
      const { codespaceId, branchName } = req.body;
      const session = await CodespaceService.createBranchWithSession(
        codespaceId,
        branchName
      );

      res.status(201).json({
        session,
        message: "Session created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateGitHubDetails(req, res, next) {
    try {
      const { id } = req.params;
      const { githubRepo, githubAccessToken } = req.body;

      if (!githubRepo || !githubRepo.trim()) {
        return res.status(400).json({
          error: "GitHub repository path is required",
          code: "MISSING_GITHUB_REPO",
        });
      }

      const result = await CodespaceService.updateGitHubDetails(
        id,
        req.user.id,
        githubRepo,
        githubAccessToken
      );

      res.json({
        message: "GitHub details updated successfully",
        workspace: result,
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
