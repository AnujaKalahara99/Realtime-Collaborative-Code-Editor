import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import { useTheme } from "../../../Contexts/ThemeProvider";
import CodeEditorHomepage from "../../Home/Homepage";

// Mock useTheme
jest.mock("../../../Contexts/ThemeProvider", () => ({
  useTheme: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: () => mockNavigate,
}));

describe("CodeEditorHomepage", () => {
  beforeEach(() => {
    (useTheme as jest.Mock).mockReturnValue({
      isDark: false,
      toggleTheme: jest.fn(),
    });
    mockNavigate.mockReset();
  });

  it("renders the main heading", () => {
    render(
      <MemoryRouter>
        <CodeEditorHomepage />
      </MemoryRouter>
    );
    expect(
      screen.getByText(/Real-Time Collaborative Code Editor/i)
    ).toBeInTheDocument();
  });

  it("renders the Features section", () => {
    render(
      <MemoryRouter>
        <CodeEditorHomepage />
      </MemoryRouter>
    );
    expect(screen.getByText(/Real-Time Collaboration/i)).toBeInTheDocument();
    expect(screen.getByText(/Development Environment/i)).toBeInTheDocument();
    // Use getAllByText for 'Version Control' to avoid multiple match error
    const versionControlMatches = screen.getAllByText(/Version Control/i);
    expect(versionControlMatches.length).toBeGreaterThan(0);
    expect(screen.getByText(/Role-Based Access/i)).toBeInTheDocument();
  });

  it("navigates to login on Sign In click", () => {
    render(
      <MemoryRouter>
        <CodeEditorHomepage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/Sign In/i));
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("navigates to signup on Get Started click", () => {
    render(
      <MemoryRouter>
        <CodeEditorHomepage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getAllByText(/Get Started/i)[0]);
    expect(mockNavigate).toHaveBeenCalledWith("/signup");
  });

  it("toggles theme when theme button is clicked", () => {
    const toggleTheme = jest.fn();
    (useTheme as jest.Mock).mockReturnValue({
      isDark: false,
      toggleTheme,
    });
    render(
      <MemoryRouter>
        <CodeEditorHomepage />
      </MemoryRouter>
    );
    fireEvent.click(screen.getByLabelText(/toggle theme/i));
    expect(toggleTheme).toHaveBeenCalled();
  });
});
