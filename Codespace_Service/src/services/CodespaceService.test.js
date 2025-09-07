import { CodespaceService } from "./codespaceService.js";
import { supabase } from "./supabaseClient.js";
import nodemailer from "nodemailer";

jest.mock("./supabaseClient.js", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      eq: jest.fn(),
      single: jest.fn(),
    })),
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
  });



  describe("createCodespace", () => {
    it("should create workspace and owner membership", async () => {
      supabase.from.mockImplementation((table) => {
        if (table === "workspaces") {
          return {
            insert: jest.fn().mockReturnValue({
              select: () => ({
                single: () => Promise.resolve({ data: { id: "1", name: "WS" }, error: null }),
              }),
            }),
          };
        }
        if (table === "workspace_members") {
          return {
            insert: jest.fn().mockReturnValue({
              select: () => ({
                single: () => Promise.resolve({ data: { id: "member1" }, error: null }),
              }),
            }),
          };
        }
      });

      const result = await CodespaceService.createCodespace("WS", "user1");
      expect(result.role).toBe("owner");
    });
});

  describe("updateCodespace", () => {
    it("should update workspace name", async () => {
      jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue(true);
      jest.spyOn(CodespaceService, "getUserCodespaceMembership").mockResolvedValue({ role: "admin" });

      supabaseMock.update.mockReturnValue({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "1", name: "Updated WS", created_at: "2023-01-01T00:00:00Z" } }),
          }),
        }),
      });

      const result = await CodespaceService.updateCodespace("1", "Updated WS", "user1");
      expect(result.name).toBe("Updated WS");
    });
  });

  describe("deleteCodespace", () => {
    it("should delete a workspace if user has permission", async () => {
      jest.spyOn(CodespaceService, "checkUserPermission").mockResolvedValue(true);
      supabaseMock.delete.mockReturnValue({ eq: () => Promise.resolve({ error: null }) });

      const result = await CodespaceService.deleteCodespace("1", "user1");
      expect(result).toBe(true);
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

      const result = await CodespaceService.shareCodespaceByEmail("1", "test@example.com", "user1", "member");
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
        .mockResolvedValueOnce({ data: { id: "user1" } }); // profile

      supabaseMock.update.mockReturnValue({
        eq: () => ({ select: () => ({ single: () => Promise.resolve({ data: { id: "invite1", accepted_at: "2023" } }) }) }),
      });

      supabaseMock.insert.mockReturnValue({
        select: () => ({ single: () => Promise.resolve({ data: { id: "member1" } }) }),
      });

      const result = await CodespaceService.acceptInvitation("invite1");
      expect(result.member).toBeDefined();
    });
  });
});
