import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../../../Contexts/ThemeProvider", () => ({
  useTheme: () => ({
    theme: { textMuted: "text-gray-500" },
  }),
}));

const makeCodespace = (name: string) => ({
  id: name,
  name,
  lastModified: "",
  created_at: "",
  owner: "",
  collaborators: [],
  isPublic: false,
  role: "Developer",
  createdAt: "",
  updatedAt: "",
  description: "",
});

describe("EmptyState", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("does not render when loading", () => {
    jest.doMock("../../../Contexts/CodespaceContext", () => ({
      useCodespaceContext: () => ({ codespaces: [], loading: true }),
    }));
    const EmptyStateLoading = require("../EmptyState").default;
    render(<EmptyStateLoading searchQuery="" />);
    expect(screen.queryByText(/No codespaces yet/i)).not.toBeInTheDocument();
  });

  test("shows no codespaces message when empty", () => {
    jest.doMock("../../../Contexts/CodespaceContext", () => ({
      useCodespaceContext: () => ({ codespaces: [], loading: false }),
    }));
    const EmptyStateNoCodespaces = require("../EmptyState").default;
    render(<EmptyStateNoCodespaces searchQuery="" />);
    expect(screen.getByText(/No codespaces yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Create your first codespace/i)
    ).toBeInTheDocument();
  });

  test("shows no matching codespaces for search", () => {
    jest.doMock("../../../Contexts/CodespaceContext", () => ({
      useCodespaceContext: () => ({
        codespaces: [makeCodespace("Alpha")],
        loading: false,
      }),
    }));
    const EmptyStateNoMatch = require("../EmptyState").default;
    render(<EmptyStateNoMatch searchQuery="zzz" />);
    expect(screen.getByText(/No matching codespaces/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Try adjusting your search query/i)
    ).toBeInTheDocument();
  });

  test("does not render if codespaces exist and search matches", () => {
    jest.doMock("../../../Contexts/CodespaceContext", () => ({
      useCodespaceContext: () => ({
        codespaces: [makeCodespace("Alpha")],
        loading: false,
      }),
    }));
    const EmptyStateMatch = require("../EmptyState").default;
    render(<EmptyStateMatch searchQuery="alp" />);
    expect(screen.queryByText(/No codespaces yet/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/No matching codespaces/i)
    ).not.toBeInTheDocument();
  });
});
