import * as React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useTheme } from "../../../Contexts/ThemeProvider";
import { useCodespaceContext } from "../../../Contexts/CodespaceContext";
import Dashboard from "../Dashboard";

// Mocks
jest.mock("../../../Contexts/ThemeProvider", () => ({ useTheme: jest.fn() }));
jest.mock("../../../Contexts/CodespaceContext", () => ({ useCodespaceContext: jest.fn() }));
jest.mock("../TitleBar", () => () => <div data-testid="titlebar" />);
jest.mock("../SearchAndControls", () => () => <div data-testid="search-controls" />);
jest.mock("../CodespaceGrid", () => () => <div data-testid="codespace-grid" />);
jest.mock("../EmptyState", () => () => <div data-testid="empty-state" />);
jest.mock("../CreateCodespaceModal", () => () => <div data-testid="create-modal" />);

const mockSession = { user: { user_metadata: { avatar_url: "avatar.png" } } };

describe("Dashboard", () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({ theme: { surface: "bg-white" } });
    (useCodespaceContext as jest.Mock).mockReturnValue({ error: null });
  });

  it("renders all main dashboard sections", () => {
    const { getByTestId } = render(
      <MemoryRouter>
        <Dashboard session={mockSession as any} />
      </MemoryRouter>
    );
    expect(getByTestId("titlebar")).toBeInTheDocument();
    expect(getByTestId("search-controls")).toBeInTheDocument();
    expect(getByTestId("codespace-grid")).toBeInTheDocument();
    expect(getByTestId("empty-state")).toBeInTheDocument();
    expect(getByTestId("create-modal")).toBeInTheDocument();
  });
});
