import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("../../../Contexts/ThemeProvider", () => ({
  useTheme: () => ({
    theme: {
      background: "bg-white",
      surface: "bg-gray-100",
      border: "border-gray-200",
      text: "text-black",
      textMuted: "text-gray-500",
      hover: "hover:bg-gray-200",
    },
  }),
}));
jest.mock("react-router", () => ({
  useNavigate: () => jest.fn(),
}));

import React from 'react';
import { ToastProvider } from '../../../Contexts/ToastContext';

// Replace require() with import for dynamically mocked components
import ProfilePageLoading from '../profile';
import ProfilePageError from '../profile';
import ProfilePageLoaded from '../profile';

beforeAll(() => {
  Object.defineProperty(import.meta, 'env', {
    value: {
      VITE_SUPABASE_URL: 'https://your-supabase-url.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'your-anon-key',
    },
  });
});

describe("ProfilePage", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("shows loading spinner", () => {
    jest.doMock("../../../Contexts/ProfileContext", () => ({
      useProfile: () => ({ profileData: {}, loading: true, error: null }),
    }));
    render(
      <ToastProvider>
        <ProfilePageLoading />
      </ToastProvider>
    );
    expect(screen.getByText(/Loading profile/i)).toBeInTheDocument();
  });

  test("shows error and retry button", () => {
    jest.doMock("../../../Contexts/ProfileContext", () => ({
      useProfile: () => ({ profileData: {}, loading: false, error: "Failed" }),
    }));
    render(
      <ToastProvider>
        <ProfilePageError />
      </ToastProvider>
    );
    expect(screen.getByText(/Error: Failed/i)).toBeInTheDocument();
    expect(screen.getByText(/Retry/i)).toBeInTheDocument();
  });

  test("renders profile data", () => {
    jest.doMock("../../../Contexts/ProfileContext", () => ({
      useProfile: () => ({
        profileData: {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          bio: "Developer",
          location: "Earth",
          jobTitle: "Engineer",
          phone: "1234567890",
          website: "https://example.com",
          techStacks: ["React", "Node.js"],
          profilePicture: "",
        },
        loading: false,
        error: null,
      }),
    }));
    render(
      <ToastProvider>
        <ProfilePageLoaded />
      </ToastProvider>
    );
    // Name is rendered as 'John Doe' in one element
    expect(
      screen.getByText(
        (content) => content.includes("John") && content.includes("Doe")
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Developer"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Engineer"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Earth"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("1234567890"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("https://example.com"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("React"))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("Node.js"))
    ).toBeInTheDocument();
  });
});
