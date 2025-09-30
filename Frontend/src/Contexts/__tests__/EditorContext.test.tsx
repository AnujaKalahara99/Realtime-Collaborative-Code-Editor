import React from "react";
import { render, screen } from "@testing-library/react";
import { EditorCollaborationProvider, useEditorCollaboration } from "../EditorContext";

describe("EditorCollaborationProvider", () => {
  const TestComponent = () => {
    const context = useEditorCollaboration();
    return (
      <div>
        <span data-testid="loading">{context.loading ? "true" : "false"}</span>
        <span data-testid="connected">{context.isConnected ? "true" : "false"}</span>
        <span data-testid="files">{context.files.length}</span>
      </div>
    );
  };

  it("provides default context values", () => {
    render(
      <EditorCollaborationProvider AuthSession={null}>
        <TestComponent />
      </EditorCollaborationProvider>
    );
    expect(screen.getByTestId("loading").textContent).toBe("true");
    expect(screen.getByTestId("connected").textContent).toBe("false");
    expect(screen.getByTestId("files").textContent).toBe("0");
  });
});
