import { Router } from "express";
import { MemberController } from "../controllers/memberController.js";
import { extractUser } from "../middleware/auth.js";
import { validateCodespaceId } from "../middleware/validation.js";

const router = Router();

// All member routes require authentication
router.use(extractUser);
// Get workspace members, add, delete, and update member roles

router.get(
  "/:id/members",
  validateCodespaceId,
  MemberController.getCodespaceMembers
);

router.post("/:id/members", validateCodespaceId, MemberController.addMember);

router.delete(
  "/:id/members/:userId",
  validateCodespaceId,
  MemberController.removeMember
);

router.put(
  "/:id/members/:userId",
  validateCodespaceId,
  MemberController.updateMemberRole
);

export default router;
