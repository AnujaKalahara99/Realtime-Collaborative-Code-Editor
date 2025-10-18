import { CodespaceService } from "../services/codespaceService.js";
import { supabase } from "../services/supabaseClient.js";
import nodemailer from "nodemailer";

jest.mock("../services/supabaseClient.js", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

jest.mock("nodemailer");

describe("CodespaceService", () => {
  let supabaseMock;
  let transporterMock;

  beforeEach(() => {
    supabaseMock = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
    };

    supabase.from.mockReturnValue(supabaseMock);

    transporterMock = { sendMail: jest.fn().mockResolvedValue(true) };
    nodemailer.createTransport.mockReturnValue(transporterMock);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserCodespaces", () => {
    it("should return mapped workspaces", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockResolvedValue({
        data: [
          {
            id: "1",
            name: "Test Workspace",
            created_at: "2023-01-01T00:00:00Z",
            workspace_members: [{ role: "owner" }],
          },
        ],
        error: null,
      });

      const result = await CodespaceService.getUserCodespaces("user1");

      expect(result[0]).toHaveProperty("id", "1");
      expect(result[0]).toHaveProperty("role", "owner");
    });

    it("should throw error if database query fails", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockResolvedValue({
        data: null,
        error: new Error("Database error"),
      });

      await expect(CodespaceService.getUserCodespaces("user1")).rejects.toThrow("Database error");
    });
  });



  describe("createCodespace", () => {
    it("should create workspace and owner membership", async () => {
      supabase.rpc.mockResolvedValue({
        data: [
          {
            workspace_id: "1",
            workspace_name: "WS",
            workspace_created_at: "2023-01-01T00:00:00Z",
            role: "owner",
            repo_id: null,
            branch_id: null,
            session_id: null,
          },
        ],
        error: null,
      });

      const result = await CodespaceService.createCodespace("WS", "user1");
      expect(result.role).toBe("owner");
      expect(result.name).toBe("WS");
      expect(supabase.rpc).toHaveBeenCalledWith("create_codespace", {
        p_workspace_name: "WS",
        p_user_id: "user1",
      });
    });
});

  describe("updateCodespace", () => {
    it("should update workspace name", async () => {
      const checkPermSpy = jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue(true);
      const getMembershipSpy = jest.spyOn(CodespaceService, "getUserCodespaceMembership").mockResolvedValue({ role: "admin" });

      supabaseMock.update.mockReturnValue({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "1", name: "Updated WS", created_at: "2023-01-01T00:00:00Z" } }),
          }),
        }),
      });

      const result = await CodespaceService.updateCodespace("1", "Updated WS", "user1");
      expect(result.name).toBe("Updated WS");
      
      checkPermSpy.mockRestore();
      getMembershipSpy.mockRestore();
    });
  });

  describe("deleteCodespace", () => {
    it("should delete a workspace if user has permission", async () => {
      const checkPermSpy = jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue(true);
      supabaseMock.delete.mockReturnValue({ eq: () => Promise.resolve({ error: null }) });

      const result = await CodespaceService.deleteCodespace("1", "user1");
      expect(result).toBe(true);
      
      checkPermSpy.mockRestore();
    });
  });

  describe("shareCodespaceByEmail", () => {
    it("should insert invitation and send email", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "1" } }) // workspace exists
        .mockResolvedValueOnce({ data: { id: "user1" } }) // user exists
        .mockResolvedValueOnce({ data: null }); // no existing invitation

      supabaseMock.insert.mockReturnValue({
        select: () => ({ single: () => Promise.resolve({ data: { id: "invite1" } }) }),
      });

      const result = await CodespaceService.shareCodespaceByEmail("1", "test@example.com", "user1", "member", "sender@example.com");
      expect(result.invitation).toBeDefined();
      expect(transporterMock.sendMail).toHaveBeenCalled();
    });
  });

  describe("acceptInvitation", () => {
    it("should accept invitation and add user to workspace", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();

      // Mock invitation fetch
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "invite1", email: "test@example.com", workspace_id: "1", role: "member" } })
        .mockResolvedValueOnce({ data: { id: "user1" } }) // profile
        .mockResolvedValueOnce({ data: null }); // no existing member

      supabaseMock.update.mockReturnValue({
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "invite1", accepted_at: "2023" } }) }) }),
      });

      supabaseMock.insert.mockReturnValue({
        select: () => ({ single: () => Promise.resolve({ data: { id: "member1" } }) }),
      });

      const result = await CodespaceService.acceptInvitation("invite1");
      expect(result.member).toBeDefined();
    });

    it("should throw error if invitation not found", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: new Error("Not found") });

      await expect(CodespaceService.acceptInvitation("invalid")).rejects.toThrow("Invitation not found");
    });

    it("should throw error if user profile not found", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "invite1", email: "test@example.com", workspace_id: "1", role: "member" } })
        .mockResolvedValueOnce({ data: null, error: new Error("Profile not found") });

      await expect(CodespaceService.acceptInvitation("invite1")).rejects.toThrow("User profile not found");
    });

    it("should throw error if user is already a member", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "invite1", email: "test@example.com", workspace_id: "1", role: "member" } })
        .mockResolvedValueOnce({ data: { id: "user1" } })
        .mockResolvedValueOnce({ data: { id: "existingMember" } }); // existing member

      supabaseMock.update.mockReturnValue({
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "invite1", accepted_at: "2023" } }) }) }),
      });

      await expect(CodespaceService.acceptInvitation("invite1")).rejects.toThrow("User is already a member of this workspace");
    });
  });

  describe("removeMember", () => {
    it("should remove invitation and member successfully", async () => {
      supabaseMock.delete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: { id: "user1" }, error: null });

      const result = await CodespaceService.removeMember("cs1", "test@example.com");
      expect(result.success).toBe(true);
    });

    it("should handle case when profile not found", async () => {
      supabaseMock.delete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      });

      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: { code: "PGRST116" } });

      const result = await CodespaceService.removeMember("cs1", "test@example.com");
      expect(result.success).toBe(true);
    });

    it("should throw error if invitation deletion fails", async () => {
      supabaseMock.delete.mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: new Error("Delete failed") }),
        }),
      });

      await expect(CodespaceService.removeMember("cs1", "test@example.com")).rejects.toThrow("Delete failed");
    });
  });

  describe("getCodespaceDetails", () => {
    it("should return codespace details", async () => {
      supabase.rpc.mockResolvedValue({
        data: [
          {
            id: "1",
            name: "Test WS",
            created_at: "2023-01-01",
            role: "owner",
            owner: "user1",
            githubrepo: "repo",
            sessions: [],
          },
        ],
        error: null,
      });

      const result = await CodespaceService.getCodespaceDetails("user1", "1");
      expect(result.id).toBe("1");
      expect(result.name).toBe("Test WS");
      expect(result.role).toBe("owner");
    });

    it("should throw error if rpc call fails", async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: new Error("RPC failed"),
      });

      await expect(CodespaceService.getCodespaceDetails("user1", "1")).rejects.toThrow("RPC failed");
    });
  });

  describe("getAllInvitedUsers", () => {
    it("should return invited users with avatars", async () => {
      // First call to get invitations
      const invitationsMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({
          data: [{ email: "test@example.com", role: "member", accepted_at: null }],
          error: null,
        }),
      };

      // Second call to get profiles
      const profilesMock = {
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({
            data: [{ email: "test@example.com", avatar_url: "http://avatar.png" }],
            error: null,
          }),
        }),
      };

      supabase.from
        .mockReturnValueOnce(invitationsMock)
        .mockReturnValueOnce(profilesMock);

      const result = await CodespaceService.getAllInvitedUsers("cs1");
      expect(result).toHaveLength(1);
      expect(result[0].avatar_url).toBe("http://avatar.png");
    });

    it("should return empty array when no invitations", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockResolvedValue({ data: [], error: null });

      const result = await CodespaceService.getAllInvitedUsers("cs1");
      expect(result).toEqual([]);
    });

    it("should handle null data", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockResolvedValue({ data: null, error: null });

      const result = await CodespaceService.getAllInvitedUsers("cs1");
      expect(result).toEqual([]);
    });
  });

  describe("createBranchWithSession", () => {
    it("should create branch with session successfully", async () => {
      supabase.rpc.mockResolvedValue({
        data: { id: "session1", branch_name: "main" },
        error: null,
      });

      const result = await CodespaceService.createBranchWithSession("cs1", "main");
      expect(result.id).toBe("session1");
    });

    it("should throw error for duplicate branch", async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Branch already exists" },
      });

      await expect(
        CodespaceService.createBranchWithSession("cs1", "main")
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "BRANCH_ALREADY_EXISTS",
      });
    });

    it("should throw error if workspace not found", async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Workspace not found" },
      });

      await expect(
        CodespaceService.createBranchWithSession("cs1", "main")
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "WORKSPACE_NOT_FOUND",
      });
    });

    it("should throw generic error for other failures", async () => {
      supabase.rpc.mockResolvedValue({
        data: null,
        error: { message: "Some other error" },
      });

      await expect(
        CodespaceService.createBranchWithSession("cs1", "main")
      ).rejects.toMatchObject({
        code: "BRANCH_CREATION_FAILED",
      });
    });
  });

  describe("checkUserPermission", () => {
    it("should return role if user has permission", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { role: "owner" }, error: null }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      const result = await CodespaceService.checkUserPermission("cs1", "user1", ["owner", "admin"]);
      expect(result.role).toBe("owner");
    });

    it("should throw error if user not found", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error("Not found") }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.checkUserPermission("cs1", "user1", ["owner"])
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "CODESPACE_NOT_FOUND",
      });
    });

    it("should throw error if user has insufficient permissions", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { role: "member" }, error: null }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.checkUserPermission("cs1", "user1", ["owner", "admin"])
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "INSUFFICIENT_PERMISSIONS",
      });
    });

    it("should return data when no role restrictions", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { role: "member" }, error: null }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      const result = await CodespaceService.checkUserPermission("cs1", "user1", []);
      expect(result.role).toBe("member");
    });
  });

  describe("getUserCodespaceMembership", () => {
    it("should return membership role", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      const result = await CodespaceService.getUserCodespaceMembership("cs1", "user1");
      expect(result.role).toBe("admin");
    });

    it("should throw error if membership not found", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: new Error("Not found") }),
      };
      
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.getUserCodespaceMembership("cs1", "user1")
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "MEMBERSHIP_NOT_FOUND",
      });
    });
  });

  describe("shareCodespaceByEmail - error cases", () => {
    it("should throw error if codespace ID is empty", async () => {
      await expect(
        CodespaceService.shareCodespaceByEmail("", "test@example.com", "user1", "member", "sender@example.com")
      ).rejects.toThrow("Codespace ID is required");
    });

    it("should throw error if email is empty", async () => {
      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "", "user1", "member", "sender@example.com")
      ).rejects.toThrow("Email is required");
    });

    it("should throw error if user ID is missing", async () => {
      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "test@example.com", null, "member", "sender@example.com")
      ).rejects.toThrow("User ID is required");
    });

    it("should throw error if workspace not found", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "test@example.com", "user1", "member", "sender@example.com")
      ).rejects.toThrow("Workspace not found");
    });

    it("should throw error if user not found", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: { id: "cs1" }, error: null })
          .mockResolvedValueOnce({ data: null, error: null }),
      };
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "test@example.com", "user1", "member", "sender@example.com")
      ).rejects.toThrow("User not found");
    });

    it("should throw error if invitation already exists", async () => {
      const freshMock = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn()
          .mockResolvedValueOnce({ data: { id: "cs1" }, error: null })
          .mockResolvedValueOnce({ data: { id: "user1" }, error: null })
          .mockResolvedValueOnce({ data: { id: "existing-invite" }, error: null }),
      };
      supabase.from.mockReturnValue(freshMock);

      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "test@example.com", "user1", "member", "sender@example.com")
      ).rejects.toThrow("Invitation already exists");
    });

    it("should throw error if insert fails", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "cs1" }, error: null })
        .mockResolvedValueOnce({ data: { id: "user1" }, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      supabaseMock.insert.mockReturnValue({
        select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Insert failed" } }) }),
      });

      await expect(
        CodespaceService.shareCodespaceByEmail("cs1", "test@example.com", "user1", "member", "sender@example.com")
      ).rejects.toThrow("Failed to insert invitation");
    });
  });

  describe("acceptInvitationEmail", () => {
    it("should return email from invitation", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({
        data: { email: "test@example.com" },
        error: null,
      });

      const result = await CodespaceService.acceptInvitationEmail("invite1");
      expect(result.email).toBe("test@example.com");
    });

    it("should throw error if invitation not found", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single.mockResolvedValue({ data: null, error: new Error("Not found") });

      await expect(CodespaceService.acceptInvitationEmail("invalid")).rejects.toThrow("Invitation not found");
    });
  });

  describe("acceptInvitation - additional error cases", () => {
    it("should throw error if update fails", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "invite1", email: "test@example.com", workspace_id: "1", role: "member" } })
        .mockResolvedValueOnce({ data: { id: "user1" } });

      supabaseMock.update.mockReturnValue({
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Update failed" } }) }) }),
      });

      await expect(CodespaceService.acceptInvitation("invite1")).rejects.toThrow("Failed to accept invitation");
    });

    it("should throw error if member insert fails", async () => {
      supabaseMock.select.mockReturnThis();
      supabaseMock.eq.mockReturnThis();
      supabaseMock.single
        .mockResolvedValueOnce({ data: { id: "invite1", email: "test@example.com", workspace_id: "1", role: "member" } })
        .mockResolvedValueOnce({ data: { id: "user1" } })
        .mockResolvedValueOnce({ data: null }); // no existing member

      supabaseMock.update.mockReturnValue({
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "invite1", accepted_at: "2023" } }) }) }),
      });

      supabaseMock.insert.mockReturnValue({
        select: () => ({ single: () => Promise.resolve({ data: null, error: { message: "Insert failed" } }) }),
      });

      await expect(CodespaceService.acceptInvitation("invite1")).rejects.toThrow("Failed to add user to workspace");
    });
  });

  describe("updateGitHubDetails", () => {
    it("should update GitHub details successfully", async () => {
      jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue({ role: "owner" });

      supabaseMock.update.mockReturnValue({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: {
                id: "cs1",
                name: "Test WS",
                created_at: "2023-01-01",
                github_repo: "user/repo",
              },
              error: null,
            }),
          }),
        }),
      });

      const result = await CodespaceService.updateGitHubDetails("cs1", "user1", "user/repo", "token123");
      expect(result.githubRepo).toBe("user/repo");
    });

    it("should throw error on update failure", async () => {
      jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue({ role: "owner" });

      supabaseMock.update.mockReturnValue({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({
              data: null,
              error: { message: "Update failed" },
            }),
          }),
        }),
      });

      await expect(
        CodespaceService.updateGitHubDetails("cs1", "user1", "user/repo", "token123")
      ).rejects.toMatchObject({
        statusCode: 500,
        code: "UPDATE_GITHUB_FAILED",
      });
    });

    it("should throw error if permission check fails", async () => {
      const permissionError = new Error("No permission");
      permissionError.statusCode = 403;
      permissionError.code = "INSUFFICIENT_PERMISSIONS";
      
      jest.spyOn(CodespaceService, "checkUserPermission").mockRejectedValue(permissionError);

      await expect(
        CodespaceService.updateGitHubDetails("cs1", "user1", "user/repo", "token123")
      ).rejects.toMatchObject({
        statusCode: 403,
        code: "INSUFFICIENT_PERMISSIONS",
      });
    });
  });
});
