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

router.post("/:id/share", CodespaceController.shareCodespace);

router.post("/session", CodespaceController.createSession);

router.post("/", validateCodespaceData, CodespaceController.createCodespace);

router.put(
  "/:id",
  validateCodespaceId,
  validateCodespaceData,
  CodespaceController.updateCodespace
);
router.post(
  "/:id/sharebyemail",
  validateCodespaceId,
  CodespaceController.shareCodespaceByEmail
);

router.get("/:id/inviteusers", validateCodespaceId, CodespaceController.getallinvitedusers);
router.delete("/:id", validateCodespaceId, CodespaceController.deleteCodespace);
router.put(
  "/accept-invitation/:invitationId",
  CodespaceController.acceptInvitation
);

router.delete(
  "/:codespaceId/remove-member/:email",
  CodespaceController.removeMember
);
export default router;
