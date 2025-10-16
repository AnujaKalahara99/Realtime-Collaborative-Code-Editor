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
      const req = { user: { id: "user1" }, params: { id: "cs1" }, body: { email: "test@example.com", role: "member" } };
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
    // Add mock for getCodespaceDetails
    CodespaceService.getCodespaceDetails = jest.fn((userId, workspaceId) => {
      if (workspaceId === "cs1") {
        return Promise.resolve({
          id: "cs1",
          name: "CS 1",
          created_at: "2025-10-15T12:00:00Z",
          role: "admin",
          owner: "user1",
          githubrepo: null,
          sessions: [],
        });
      }
      const error = new Error("Codespace not found");
      error.statusCode = 404;
      error.code = "CODESPACE_NOT_FOUND";
      throw error;
    });

    it("should return codespace if found", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs1" } };
      const res = mockResponse();

      await CodespaceController.getCodespaceById(req, res, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        codespace: {
          id: "cs1",
          name: "CS 1",
          created_at: "2025-10-15T12:00:00Z",
          role: "admin",
          owner: "user1",
          githubrepo: null,
          sessions: [],
        },
      });
    });

    it("should return 404 if codespace not found", async () => {
      const req = { user: { id: "user1" }, params: { id: "cs2" } };
      const res = mockResponse();

      CodespaceService.getUserCodespaceMembership.mockResolvedValue({});
      CodespaceService.getUserCodespaces.mockResolvedValue([{ id: "cs1", name: "CS 1" }]);

      await CodespaceController.getCodespaceById(req, res, mockNext);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Codespace not found",
        code: "CODESPACE_NOT_FOUND",
      });
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
  });
});
