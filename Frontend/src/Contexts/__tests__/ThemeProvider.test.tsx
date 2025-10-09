import { render, screen } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";
import { act } from "react";
const ThemeConsumer = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  return (
    <>
      <span data-testid="theme-mode">{isDark ? "dark" : "light"}</span>
      <span data-testid="theme-bg">{theme.background}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </>
  );
};

describe("ThemeProvider extra coverage", () => {
  it("provides theme context and toggles theme", async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );
    // Initial state
    expect(screen.getByTestId("theme-mode").textContent).toBe("dark");
    expect(screen.getByTestId("theme-bg").textContent).toBe("bg-gray-900");
    // Toggle theme
    await act(async () => {
      screen.getByText("Toggle").click();
    });
    expect(screen.getByTestId("theme-mode").textContent).toBe("light");
    expect(screen.getByTestId("theme-bg").textContent).toBe("bg-gray-50");
  });

  it("throws error if useTheme is used outside provider", () => {
    // Suppress error output for this test
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const Broken = () => {
      useTheme();
      return null;
    };
    expect(() => render(<Broken />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );
    spy.mockRestore();
  });
});
