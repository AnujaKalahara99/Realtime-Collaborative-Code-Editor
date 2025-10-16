import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import React from 'react';
import CodespaceGrid from "../CodespaceGrid";
import { ThemeProvider } from '../../../Contexts/ThemeProvider';

// Mock CodespaceCard and CreateCodespaceCard to isolate grid logic
jest.mock("../CodespaceCard", () => (props: any) => (
  <div data-testid="codespace-card">{props.codespace?.name}</div>
));
jest.mock("../CreateCodespaceCard", () => (props: any) => (
  <button data-testid="create-codespace" onClick={props.onClick}>
    Create
  </button>
));

// Mock CodespaceContext
jest.mock("../../../Contexts/CodespaceContext", () => ({
  useCodespaceContext: () => ({
    codespaces: [
      {
        id: "1",
        name: "Alpha",
        lastModified: "",
        created_at: "",
        owner: "",
        collaborators: [],
        isPublic: false,
        role: "Developer",
        createdAt: "",
        updatedAt: "",
        description: "",
      },
      {
        id: "2",
        name: "Beta",
        lastModified: "",
        created_at: "",
        owner: "",
        collaborators: [],
        isPublic: false,
        role: "Admin",
        createdAt: "",
        updatedAt: "",
        description: "",
      },
    ],
    loading: false,
  }),
}));

// Wrap tests with ThemeProvider
const WrappedCodespaceGrid = () => (
  <ThemeProvider>
    <CodespaceGrid />
  </ThemeProvider>
);

// Replace all render calls with renderWithTheme
const renderWithTheme = (ui) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe("CodespaceGrid", () => {
  test("renders all codespaces and create card", () => {
    const onOpenCreateModal = jest.fn();
    renderWithTheme(
      <WrappedCodespaceGrid
        searchQuery=""
        viewMode="grid"
        onOpenCreateModal={onOpenCreateModal}
      />
    );
    expect(screen.getByTestId("create-codespace")).toBeInTheDocument();
    expect(screen.getAllByTestId("codespace-card")).toHaveLength(2);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  test("filters codespaces by search query", () => {
    renderWithTheme(
      <WrappedCodespaceGrid
        searchQuery="alp"
        viewMode="grid"
        onOpenCreateModal={() => {}}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
  });

  test("shows loading spinner when loading", () => {
    jest.resetModules();
    jest.doMock("../../../Contexts/CodespaceContext", () => ({
      useCodespaceContext: () => ({ codespaces: [], loading: true }),
    }));
    const CodespaceGridLoading = require("../CodespaceGrid").default;
    renderWithTheme(
      <CodespaceGridLoading
        searchQuery=""
        viewMode="grid"
        onOpenCreateModal={() => {}}
      />
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    jest.resetModules();
  });

  test("calls onOpenCreateModal when create card is clicked", () => {
    const onOpenCreateModal = jest.fn();
    renderWithTheme(
      <WrappedCodespaceGrid
        searchQuery=""
        viewMode="grid"
        onOpenCreateModal={onOpenCreateModal}
      />
    );
    fireEvent.click(screen.getByTestId("create-codespace"));
    expect(onOpenCreateModal).toHaveBeenCalled();
  });
});
