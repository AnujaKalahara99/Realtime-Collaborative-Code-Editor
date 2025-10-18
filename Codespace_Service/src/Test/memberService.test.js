import { MemberService } from "../services/memberService.js";
import { supabase } from "../services/supabaseClient.js";
import { CodespaceService } from "../services/codespaceService.js";

jest.mock("../services/supabaseClient.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock("../services/codespaceService.js", () => ({
  CodespaceService: {
    checkUserPermission: jest.fn(),
  },
}));

describe("MemberService", () => {
  let mockQuery;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    supabase.from.mockReturnValue(mockQuery);
  });

  describe("getCodespaceMembers", () => {
    it("should return mapped members", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.eq.mockResolvedValue({
        data: [
          {
            user_id: "u1",
            role: "admin",
            joined_at: "2023-01-01T00:00:00Z",
            profiles: { email: "test@example.com", name: "Test User" },
          },
        ],
        error: null,
      });

      const result = await MemberService.getCodespaceMembers("cs1", "admin1");

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("userId", "u1");
      expect(result[0]).toHaveProperty("email", "test@example.com");
      expect(result[0]).toHaveProperty("role", "admin");
    });

    it("should throw error if database query fails", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.eq.mockResolvedValue({
        data: null,
        error: new Error("DB error"),
      });

      await expect(MemberService.getCodespaceMembers("cs1", "admin1")).rejects.toThrow("DB error");
    });

    it("should handle members without profiles", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.eq.mockResolvedValue({
        data: [
          {
            user_id: "u1",
            role: "member",
            joined_at: "2023-01-01T00:00:00Z",
            profiles: null,
          },
        ],
        error: null,
      });

      const result = await MemberService.getCodespaceMembers("cs1", "admin1");

      expect(result[0].email).toBeUndefined();
      expect(result[0].name).toBeUndefined();
    });
  });

  describe("addMemberToCodespace", () => {
    it("should add member successfully", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      // Mock user lookup
      mockQuery.single
        .mockResolvedValueOnce({ data: { id: "u2" }, error: null })
        .mockResolvedValueOnce({ data: null, error: null }); // No existing member

      mockQuery.insert.mockResolvedValue({ error: null });

      const result = await MemberService.addMemberToCodespace("cs1", "newuser@example.com", "member", "admin1");

      expect(result).toBe(true);
      expect(CodespaceService.checkUserPermission).toHaveBeenCalledWith("cs1", "admin1", ["admin", "owner"]);
    });

    it("should throw error if user not found", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.single.mockResolvedValue({ data: null, error: new Error("Not found") });

      await expect(
        MemberService.addMemberToCodespace("cs1", "nonexistent@example.com", "member", "admin1")
      ).rejects.toMatchObject({
        statusCode: 404,
        code: "USER_NOT_FOUND",
      });
    });

    it("should throw error if user is already a member", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.single
        .mockResolvedValueOnce({ data: { id: "u2" }, error: null })
        .mockResolvedValueOnce({ data: { user_id: "u2" }, error: null }); // Existing member

      await expect(
        MemberService.addMemberToCodespace("cs1", "existing@example.com", "member", "admin1")
      ).rejects.toMatchObject({
        statusCode: 409,
        code: "USER_ALREADY_MEMBER",
      });
    });

    it("should throw error if insert fails", async () => {
      CodespaceService.checkUserPermission.mockResolvedValue({ role: "admin" });
      
      mockQuery.single
        .mockResolvedValueOnce({ data: { id: "u2" }, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      mockQuery.insert.mockResolvedValue({ error: new Error("Insert failed") });

      await expect(
        MemberService.addMemberToCodespace("cs1", "newuser@example.com", "member", "admin1")
      ).rejects.toThrow("Insert failed");
    });
  });

});
