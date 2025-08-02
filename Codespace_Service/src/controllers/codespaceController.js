import { CodespaceService } from "../services/codespaceService.js";

export class CodespaceController {
  static async getCodespaces(req, res, next) {
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

  static async getCodespaceById(req, res, next) {
    try {
      const { id } = req.params;

      // Check if user has access to this codespace
      const memberData = await CodespaceService.getUserCodespaceMembership(
        id,
        req.user.id
      );

      // Get codespace details
      const codespaces = await CodespaceService.getUserCodespaces(req.user.id);
      const codespace = codespaces.find((cs) => cs.id === id);

      if (!codespace) {
        return res.status(404).json({
          error: "Codespace not found",
          code: "CODESPACE_NOT_FOUND",
        });
      }

      res.json({ codespace });
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
