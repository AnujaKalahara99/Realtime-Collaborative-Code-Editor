// CodespaceService.test.js
import { supabase } from "../services/supabaseClient.js";
import { CodespaceService } from "../services/codespaceService.js";

jest.mock("../services/supabaseClient.js", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

const mockFrom = (table) => {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  supabase.from.mockReturnValue(query);
  return query;
};

describe("CodespaceService.checkUserPermission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return role data if user is a member", async () => {
    const query = mockFrom("workspace_members");
    query.single.mockResolvedValue({
      data: { role: "member" },
      error: null,
    });

    const result = await CodespaceService.checkUserPermission("ws1", "u1");
    expect(result).toEqual({ role: "member" });
  });

  it("should throw CODESPACE_NOT_FOUND if no data", async () => {
    const query = mockFrom("workspace_members");
    query.single.mockResolvedValue({ data: null, error: null });

    await expect(CodespaceService.checkUserPermission("ws1", "u1")).rejects.toMatchObject({
      code: "CODESPACE_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("should throw CODESPACE_NOT_FOUND if supabase returns error", async () => {
    const query = mockFrom("workspace_members");
    query.single.mockResolvedValue({ data: null, error: new Error("DB error") });

    await expect(CodespaceService.checkUserPermission("ws1", "u1")).rejects.toMatchObject({
      code: "CODESPACE_NOT_FOUND",
      statusCode: 404,
    });
  });

  it("should allow user with required role", async () => {
    const query = mockFrom("workspace_members");
    query.single.mockResolvedValue({ data: { role: "admin" }, error: null });

    const result = await CodespaceService.checkUserPermission("ws1", "u1", ["admin"]);
    expect(result).toEqual({ role: "admin" });
  });

  it("should throw INSUFFICIENT_PERMISSIONS if role not allowed", async () => {
    const query = mockFrom("workspace_members");
    query.single.mockResolvedValue({ data: { role: "member" }, error: null });

    await expect(
      CodespaceService.checkUserPermission("ws1", "u1", ["admin"])
    ).rejects.toMatchObject({
      code: "INSUFFICIENT_PERMISSIONS",
      statusCode: 403,
    });
  });
});
