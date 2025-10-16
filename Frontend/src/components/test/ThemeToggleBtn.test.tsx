import React from 'react';
import { render } from "@testing-library/react";
import { ThemeProvider } from "../../Contexts/ThemeProvider";
import ThemeToggleBtn from "../ThemeToggleBtn";

describe("ThemeToggleBtn", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider>
        <ThemeToggleBtn />
      </ThemeProvider>
    );
  });
});

