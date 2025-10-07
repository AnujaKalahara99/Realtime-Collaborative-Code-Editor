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
      //console.log("Sharing codespace by email:", id, email, req.user.id);

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
      const codespace = await CodespaceService.getCodespaceDetails(
        req.user.id,
        req.params.id
      );
      res.json({
        codespace,
      });
    } catch (error) {
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

  static async createSession(req, res, next) {
    try {
      const { codespaceId, branchName } = req.body;
      const codespace = await CodespaceService.createBranchWithSession(
        codespaceId,
        branchName
      );

      res.status(201).json({
        codespace,
        message: "Session created successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}
