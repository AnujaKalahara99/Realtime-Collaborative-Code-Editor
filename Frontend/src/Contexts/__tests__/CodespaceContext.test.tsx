import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react";
import { CodespaceProvider, useCodespaceContext } from "../CodespaceContext";
// Mock fetch globally for all tests

afterEach(() => {
  jest.clearAllMocks();
});

// Mock session object with all required fields
const mockSession = {
  user: {
    id: "user-id-123",
    app_metadata: {},
    user_metadata: { full_name: "Test User" },
    aud: "authenticated",
    created_at: "2023-01-01T00:00:00.000Z",
    email: "test@example.com",
  },
  access_token: "mock-token",
  refresh_token: "mock-refresh-token",
  expires_in: 3600,
  token_type: "bearer",
};

// Test consumer component
const Consumer = () => {
  const context = useCodespaceContext();
  return (
    <div>
      <span data-testid="codespaces-length">{context.codespaces.length}</span>
      <span data-testid="loading">
        {context.loading ? "loading" : "not-loading"}
      </span>
      <span data-testid="error">{context.error}</span>
    </div>
  );
};

describe("CodespaceContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("provides default values", async () => {
    (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ codespaces: [] }),
    });
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <Consumer />
        </CodespaceProvider>
      );
    });
    expect(screen.getByTestId("codespaces-length").textContent).toBe("0");
    expect(screen.getByTestId("loading").textContent).toBe("not-loading");
    expect(
      [null, "", undefined, ""].includes(
        screen.getByTestId("error").textContent
      )
    ).toBe(true);
  });

  it("creates a codespace", async () => {
    const codespace = {
      id: "1",
      name: "TestSpace",
      lastModified: "now",
      created_at: "now",
      owner: "Test User",
      role: "owner",
    };
    (global.fetch as jest.Mock) = jest
      .fn()
      // Initial fetchCodespaces (empty)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ codespaces: [] }),
      })
      // createCodespace (returns new codespace)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codespace }) });
    let contextRef: any;
    const ConsumerWithCreate = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithCreate />
        </CodespaceProvider>
      );
    });
    let result;
    await act(async () => {
      result = await contextRef.createCodespace("TestSpace");
    });
    expect(result).toBe(true);
    expect(contextRef.codespaces.length).toBe(1);
    expect(contextRef.codespaces[0].name).toBe("TestSpace");
  });

  it("deletes a codespace", async () => {
    const codespace = {
      id: "2",
      name: "ToDelete",
      lastModified: "now",
      created_at: "now",
      owner: "Test User",
      role: "owner",
    };
    (global.fetch as jest.Mock) = jest
      .fn()
      // Initial fetchCodespaces (empty)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ codespaces: [] }),
      })
      // createCodespace (returns new codespace)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codespace }) })
      // deleteCodespace (returns success)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    let contextRef: any;
    const ConsumerWithDelete = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithDelete />
        </CodespaceProvider>
      );
    });
    await act(async () => {
      await contextRef.createCodespace("ToDelete");
    });
    expect(contextRef.codespaces.length).toBe(1);
    let result;
    await act(async () => {
      result = await contextRef.deleteCodespace("2");
    });
    expect(result).toBe(true);
    expect(contextRef.codespaces.length).toBe(0);
  });

  it("edits a codespace name", async () => {
    const codespace = {
      id: "3",
      name: "OldName",
      lastModified: "now",
      created_at: "now",
      owner: "Test User",
      role: "owner",
    };
    (global.fetch as jest.Mock) = jest
      .fn()
      // Initial fetchCodespaces (empty)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ codespaces: [] }),
      })
      // createCodespace (returns new codespace)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ codespace }) })
      // editCodespace (returns success)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    let contextRef: any;
    const ConsumerWithEdit = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithEdit />
        </CodespaceProvider>
      );
    });
    await act(async () => {
      await contextRef.createCodespace("OldName");
    });
    let result;
    await act(async () => {
      result = await contextRef.editCodespace("3", "NewName");
    });
    expect(result).toBe(true);
    expect(contextRef.codespaces[0].name).toBe("NewName");
  });

  it("shares a codespace by email", async () => {
    (global.fetch as jest.Mock) = jest
      .fn()
      // Initial fetchCodespaces (empty)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ codespaces: [] }),
      })
      // shareCodespaceByEmail (success)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    let contextRef: any;
    const ConsumerWithShare = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithShare />
        </CodespaceProvider>
      );
    });
    let result;
    await act(async () => {
      result = await contextRef.shareCodespaceByEmail(
        "id",
        "test@email.com",
        "editor"
      );
    });
    expect(result).toBe(true);
  });

  it("handles invalid email in shareCodespaceByEmail", async () => {
    let contextRef: any;
    const ConsumerWithShare = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithShare />
        </CodespaceProvider>
      );
    });
    let result;
    await act(async () => {
      result = await contextRef.shareCodespaceByEmail(
        "id",
        "bademail",
        "editor"
      );
    });
    expect(result).toBe(false);
    expect(contextRef.error).toBe("Invalid email address");
  });

  it("handles empty workspace name in createCodespace", async () => {
    let contextRef: any;
    const ConsumerWithCreate = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithCreate />
        </CodespaceProvider>
      );
    });
    let result;
    await act(async () => {
      result = await contextRef.createCodespace("");
    });
    expect(result).toBe(false);
    expect(contextRef.error).toBe("Workspace name cannot be empty");
  });

  it("handles empty new name in editCodespace", async () => {
    let contextRef: any;
    const ConsumerWithEdit = () => {
      const context = useCodespaceContext();
      contextRef = context;
      return <div />;
    };
    await act(async () => {
      render(
        <CodespaceProvider session={mockSession}>
          <ConsumerWithEdit />
        </CodespaceProvider>
      );
    });
    let result;
    await act(async () => {
      result = await contextRef.editCodespace("id", "");
    });
    expect(result).toBe(false);
    expect(contextRef.error).toBe("Codespace name cannot be empty");
  });
});
