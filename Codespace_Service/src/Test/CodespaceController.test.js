// CodespaceController.test.js
import { CodespaceController } from "../controllers/codespaceController";
import { CodespaceService } from "../services/codespaceService";

jest.mock("../services/codespaceService.js", () => ({
  CodespaceService: {
    getUserCodespaces: jest.fn(),
    createCodespace: jest.fn(),
    updateCodespace: jest.fn(),
    deleteCodespace: jest.fn(),
    shareCodespaceByEmail: jest.fn(),
    getUserCodespaceMembership: jest.fn(),
    shareCodespace: jest.fn(),
    acceptInvitation: jest.fn(),
    getCodespaceDetails: jest.fn(),
    getAllInvitedUsers: jest.fn(),
    removeMember: jest.fn(),
    acceptInvitationEmail: jest.fn(),
    createBranchWithSession: jest.fn(),
    updateGitHubDetails: jest.fn(),
  },
}));

// Mock Express req, res, next
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

describe("CodespaceController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getCodespaces", () => {
    it("should return codespaces and count", async () => {
      const req = { user: { id: "user1" } };
      const res = mockResponse();

      CodespaceService.getUserCodespaces.mockResolvedValue([
        { id: "cs1", name: "CS 1" },
      ]);

      await CodespaceController.getCodespaces(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        codespaces: [{ id: "cs1", name: "CS 1" }],
        count: 1,
      });
    });

    it("should call next on error", async () => {
      const req = { user: { id: "user1" } };
      const res = mockResponse();
      const error = new Error("DB error");

      CodespaceService.getUserCodespaces.mockRejectedValue(error);

      await CodespaceController.getCodespaces(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createCodespace", () => {
    it("should create a codespace and return 201", async () => {
      const req = { user: { id: "user1" }, body: { name: "New CS" } };
      const res = mockResponse();

      CodespaceService.createCodespace.mockResolvedValue({ id: "cs1", name: "New CS" });

      await CodespaceController.createCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        codespace: { id: "cs1", name: "New CS" },
        message: "Codespace created successfully",
      });
    });
  });

  describe("updateCodespace", () => {
    it("should update codespace successfully", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { name: "Updated CS" } };
      const res = mockResponse();

      CodespaceService.updateCodespace.mockResolvedValue({ id: "cs1", name: "Updated CS" });

      await CodespaceController.updateCodespace(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        codespace: { id: "cs1", name: "Updated CS" },
        message: "Codespace updated successfully",
      });
    });

    it("should return error status if error has statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { name: "Updated CS" } };
      const res = mockResponse();
      const error = new Error("Forbidden");
      error.statusCode = 403;
      error.code = "INSUFFICIENT_PERMISSIONS";

      CodespaceService.updateCodespace.mockRejectedValue(error);

      await CodespaceController.updateCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Forbidden",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    });
  });

  describe("deleteCodespace", () => {
    it("should delete codespace successfully", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" } };
      const res = mockResponse();

      CodespaceService.deleteCodespace.mockResolvedValue();

      await CodespaceController.deleteCodespace(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ message: "Codespace deleted successfully" });
    });
  });

  describe("shareCodespaceByEmail", () => {
    it("should return 400 if email is invalid", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { email: "invalid" } };
      const res = mockResponse();

      await CodespaceController.shareCodespaceByEmail(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    });

    it("should share codespace successfully", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { email: "test@example.com", role: "member", senderName: "Test User" } };
      const res = mockResponse();

      CodespaceService.shareCodespaceByEmail.mockResolvedValue({ invitation: { id: "inv1" } });

      await CodespaceController.shareCodespaceByEmail(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invitation sent successfully",
        invitation: { id: "inv1" },
      });
    });
  });

  describe("getCodespaceById", () => {
    it("should return codespace if found", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" } };
      const res = mockResponse();

      CodespaceService.getCodespaceDetails.mockResolvedValue({ id: "cs1", name: "CS 1" });

      await CodespaceController.getCodespaceById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({ codespace: { id: "cs1", name: "CS 1" } });
    });

    it("should return 404 if codespace not found", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs2" } };
      const res = mockResponse();
      
      const error = new Error("Codespace not found");
      error.statusCode = 404;
      error.code = "CODESPACE_NOT_FOUND";

      CodespaceService.getCodespaceDetails.mockRejectedValue(error);

      await CodespaceController.getCodespaceById(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation successfully", async () => {
      const req = { params: { invitationId: "inv1" } };
      const res = mockResponse();

      CodespaceService.acceptInvitation.mockResolvedValue({ invitation: { id: "inv1" }, member: { id: "user1" } });

      await CodespaceController.acceptInvitation(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Invitation accepted successfully",
        invitation: { id: "inv1" },
        member: { id: "user1" },
      });
    });

    it("should handle error with statusCode", async () => {
      const req = { params: { invitationId: "inv1" } };
      const res = mockResponse();
      const error = new Error("Invitation not found");
      error.statusCode = 404;
      error.code = "INVITATION_NOT_FOUND";

      CodespaceService.acceptInvitation.mockRejectedValue(error);

      await CodespaceController.acceptInvitation(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invitation not found",
        code: "INVITATION_NOT_FOUND",
      });
    });
  });

  describe("getallinvitedusers", () => {
    it("should return all invited users", async () => {
      const req = { params: { id: "cs1" } };
      const res = mockResponse();

      CodespaceService.getAllInvitedUsers.mockResolvedValue([
        { email: "user1@example.com", role: "member", accepted_at: null },
        { email: "user2@example.com", role: "admin", accepted_at: "2023-01-01" },
      ]);

      await CodespaceController.getallinvitedusers(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        invitedUsers: [
          { email: "user1@example.com", role: "member", accepted_at: null },
          { email: "user2@example.com", role: "admin", accepted_at: "2023-01-01" },
        ],
        count: 2,
      });
    });

    it("should call next on error", async () => {
      const req = { params: { id: "cs1" } };
      const res = mockResponse();
      const error = new Error("DB error");

      CodespaceService.getAllInvitedUsers.mockRejectedValue(error);

      await CodespaceController.getallinvitedusers(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("removeMember", () => {
    it("should remove member successfully", async () => {
      const req = { params: { codespaceId: "cs1", email: "test@example.com" } };
      const res = mockResponse();

      CodespaceService.removeMember.mockResolvedValue({ success: true });

      await CodespaceController.removeMember(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Member removed successfully",
      });
    });

    it("should handle error with statusCode", async () => {
      const req = { params: { codespaceId: "cs1", email: "test@example.com" } };
      const res = mockResponse();
      const error = new Error("Member not found");
      error.statusCode = 404;
      error.code = "MEMBER_NOT_FOUND";

      CodespaceService.removeMember.mockRejectedValue(error);

      await CodespaceController.removeMember(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Member not found",
        code: "MEMBER_NOT_FOUND",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { params: { codespaceId: "cs1", email: "test@example.com" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.removeMember.mockRejectedValue(error);

      await CodespaceController.removeMember(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createCodespace", () => {
    it("should call next on error", async () => {
      const req = { user: { id: "user1" }, body: { name: "New CS" } };
      const res = mockResponse();
      const error = new Error("DB error");

      CodespaceService.createCodespace.mockRejectedValue(error);

      await CodespaceController.createCodespace(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteCodespace", () => {
    it("should handle error with statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" } };
      const res = mockResponse();
      const error = new Error("Insufficient permissions");
      error.statusCode = 403;
      error.code = "INSUFFICIENT_PERMISSIONS";

      CodespaceService.deleteCodespace.mockRejectedValue(error);

      await CodespaceController.deleteCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.deleteCodespace.mockRejectedValue(error);

      await CodespaceController.deleteCodespace(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("shareCodespace", () => {
    it("should return 400 if email is invalid", async () => {
      const req = { params: { id: "cs1" }, body: { email: "invalid", senderName: "Test" } };
      const res = mockResponse();

      await CodespaceController.shareCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    });

    it("should return 400 if email is empty", async () => {
      const req = { params: { id: "cs1" }, body: { email: "", senderName: "Test" } };
      const res = mockResponse();

      await CodespaceController.shareCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid email format",
        code: "INVALID_EMAIL",
      });
    });

    it("should share codespace successfully", async () => {
      const req = { params: { id: "cs1" }, body: { email: "test@example.com", senderName: "Test User" } };
      const res = mockResponse();

      CodespaceService.shareCodespace.mockResolvedValue();

      await CodespaceController.shareCodespace(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "Codespace shared successfully",
      });
    });

    it("should handle error with statusCode", async () => {
      const req = { params: { id: "cs1" }, body: { email: "test@example.com", senderName: "Test" } };
      const res = mockResponse();
      const error = new Error("Codespace not found");
      error.statusCode = 404;
      error.code = "CODESPACE_NOT_FOUND";

      CodespaceService.shareCodespace.mockRejectedValue(error);

      await CodespaceController.shareCodespace(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Codespace not found",
        code: "CODESPACE_NOT_FOUND",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { params: { id: "cs1" }, body: { email: "test@example.com", senderName: "Test" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.shareCodespace.mockRejectedValue(error);

      await CodespaceController.shareCodespace(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("shareCodespaceByEmail", () => {
    it("should handle error with statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { email: "test@example.com", role: "member", senderName: "Test" } };
      const res = mockResponse();
      const error = new Error("Invitation already exists");
      error.statusCode = 409;
      error.code = "INVITATION_EXISTS";

      CodespaceService.shareCodespaceByEmail.mockRejectedValue(error);

      await CodespaceController.shareCodespaceByEmail(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invitation already exists",
        code: "INVITATION_EXISTS",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { email: "test@example.com", role: "member", senderName: "Test" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.shareCodespaceByEmail.mockRejectedValue(error);

      await CodespaceController.shareCodespaceByEmail(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("acceptInvitationEmail", () => {
    it("should return email successfully", async () => {
      const req = { params: { invitationId: "inv1" } };
      const res = mockResponse();

      CodespaceService.acceptInvitationEmail.mockResolvedValue({ email: "test@example.com" });

      await CodespaceController.acceptInvitationEmail(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });

    it("should handle error with statusCode", async () => {
      const req = { params: { invitationId: "inv1" } };
      const res = mockResponse();
      const error = new Error("Invitation not found");
      error.statusCode = 404;
      error.code = "INVITATION_NOT_FOUND";

      CodespaceService.acceptInvitationEmail.mockRejectedValue(error);

      await CodespaceController.acceptInvitationEmail(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invitation not found",
        code: "INVITATION_NOT_FOUND",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { params: { invitationId: "inv1" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.acceptInvitationEmail.mockRejectedValue(error);

      await CodespaceController.acceptInvitationEmail(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("createSession", () => {
    it("should create session successfully", async () => {
      const req = { body: { codespaceId: "cs1", branchName: "main" } };
      const res = mockResponse();

      CodespaceService.createBranchWithSession.mockResolvedValue({ id: "session1", branchName: "main" });

      await CodespaceController.createSession(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        session: { id: "session1", branchName: "main" },
        message: "Session created successfully",
      });
    });

    it("should call next on error", async () => {
      const req = { body: { codespaceId: "cs1", branchName: "main" } };
      const res = mockResponse();
      const error = new Error("Branch already exists");

      CodespaceService.createBranchWithSession.mockRejectedValue(error);

      await CodespaceController.createSession(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe("updateGitHubDetails", () => {
    it("should return 400 if githubRepo is missing", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { githubRepo: "" } };
      const res = mockResponse();

      await CodespaceController.updateGitHubDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "GitHub repository path is required",
        code: "MISSING_GITHUB_REPO",
      });
    });

    it("should return 400 if githubRepo is whitespace", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { githubRepo: "   " } };
      const res = mockResponse();

      await CodespaceController.updateGitHubDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "GitHub repository path is required",
        code: "MISSING_GITHUB_REPO",
      });
    });

    it("should update GitHub details successfully", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { githubRepo: "user/repo", githubAccessToken: "token123" } };
      const res = mockResponse();

      CodespaceService.updateGitHubDetails.mockResolvedValue({
        id: "cs1",
        name: "Test WS",
        githubRepo: "user/repo",
      });

      await CodespaceController.updateGitHubDetails(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        message: "GitHub details updated successfully",
        workspace: {
          id: "cs1",
          name: "Test WS",
          githubRepo: "user/repo",
        },
      });
    });

    it("should handle error with statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { githubRepo: "user/repo", githubAccessToken: "token123" } };
      const res = mockResponse();
      const error = new Error("Insufficient permissions");
      error.statusCode = 403;
      error.code = "INSUFFICIENT_PERMISSIONS";

      CodespaceService.updateGitHubDetails.mockRejectedValue(error);

      await CodespaceController.updateGitHubDetails(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Insufficient permissions",
        code: "INSUFFICIENT_PERMISSIONS",
      });
    });

    it("should call next on error without statusCode", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { githubRepo: "user/repo", githubAccessToken: "token123" } };
      const res = mockResponse();
      const error = new Error("Unexpected error");

      CodespaceService.updateGitHubDetails.mockRejectedValue(error);

      await CodespaceController.updateGitHubDetails(req, res, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
