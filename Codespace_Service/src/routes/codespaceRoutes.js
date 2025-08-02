import { Router } from "express";
import { CodespaceController } from "../controllers/codespaceController.js";
import { extractUser } from "../middleware/auth.js";
import {
  validateCodespaceData,
  validateCodespaceId,
} from "../middleware/validation.js";

const router = Router();

// All codespace routes require authentication
router.use(extractUser);

// GET /codespaces - Get all user's codespaces
router.get("/", CodespaceController.getCodespaces);

router.get("/:id", validateCodespaceId, CodespaceController.getCodespaceById);

router.post("/", validateCodespaceData, CodespaceController.createCodespace);

router.put(
  "/:id",
  validateCodespaceId,
  validateCodespaceData,
  CodespaceController.updateCodespace
);

router.delete("/:id", validateCodespaceId, CodespaceController.deleteCodespace);

export default router;
