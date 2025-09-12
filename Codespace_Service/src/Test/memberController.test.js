import { MemberController } from "../controllers/memberController.js";
import { MemberService } from "../services/memberService.js";
import { CodespaceService } from "../services/codespaceService.js";

jest.mock("../services/memberService.js");
jest.mock("../services/codespaceService.js");

describe("MemberController", () => {
  let req, res, next;

  beforeEach(() => {
    req = { params: {}, body: {}, user: { id: "user1" } };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getCodespaceMembers", () => {
    it("should return members and count", async () => {
      req.params.id = "cs1";
      const mockMembers = [{ id: "user1" }, { id: "user2" }];
      MemberService.getCodespaceMembers.mockResolvedValue(mockMembers);

      await MemberController.getCodespaceMembers(req, res, next);

      expect(MemberService.getCodespaceMembers).toHaveBeenCalledWith(
        "cs1",
        "user1"
      );
      expect(res.json).toHaveBeenCalledWith({
        members: mockMembers,
        count: mockMembers.length,
      });
    });

    it("should call next with error if service throws", async () => {
      const error = new Error("Service error");
      MemberService.getCodespaceMembers.mockRejectedValue(error);

      await MemberController.getCodespaceMembers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("addMember", () => {
    it("should add a member successfully", async () => {
      req.params.id = "cs1";
      req.body = { email: "test@example.com", role: "member" };
      MemberService.addMemberToCodespace.mockResolvedValue();

      await MemberController.addMember(req, res, next);

      expect(MemberService.addMemberToCodespace).toHaveBeenCalledWith(
        "cs1",
        "test@example.com",
        "member",
        "user1"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Member added successfully",
      });
    });

    it("should return 400 if email missing", async () => {
      req.params.id = "cs1";
      req.body = { email: "" };

      await MemberController.addMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User email is required",
        code: "MISSING_EMAIL",
      });
    });

    it("should return 400 if role invalid", async () => {
      req.params.id = "cs1";
      req.body = { email: "test@example.com", role: "superuser" };

      await MemberController.addMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid role. Must be "member" or "admin"',
        code: "INVALID_ROLE",
      });
    });
  });

  describe("removeMember", () => {
    it("should remove member successfully", async () => {
      req.params.id = "cs1";
      req.params.userId = "user2";
      MemberService.removeMemberFromCodespace.mockResolvedValue();

      await MemberController.removeMember(req, res, next);

      expect(MemberService.removeMemberFromCodespace).toHaveBeenCalledWith(
        "cs1",
        "user2",
        "user1"
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Member removed successfully",
      });
    });
  });

  describe("updateMemberRole", () => {
    it("should update role successfully", async () => {
      req.params.id = "cs1";
      req.params.userId = "user2";
      req.body.role = "admin";

      CodespaceService.checkUserPermission.mockResolvedValue();
      const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
      };
      global.supabase = mockSupabase;
      mockSupabase.error = null;

      await MemberController.updateMemberRole(req, res, next);

      expect(CodespaceService.checkUserPermission).toHaveBeenCalledWith(
        "cs1",
        "user1",
        ["admin", "owner"]
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Member role updated successfully",
      });
    });

    it("should return 400 if role invalid", async () => {
      req.body.role = "superadmin";

      await MemberController.updateMemberRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid role. Must be "member" or "admin"',
        code: "INVALID_ROLE",
      });
    });
  });
});
