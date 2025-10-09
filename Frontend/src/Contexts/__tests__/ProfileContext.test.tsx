import { render, waitFor, act } from "@testing-library/react";
import { ProfileProvider, useProfile } from "../../Contexts/ProfileContext";

// Mock supabase with chainable from().select().eq().single() and from().update()
jest.mock("../../database/superbase", () => {
  const auth = { getUser: jest.fn() };
  // We'll override these in each test
  let singleImpl = jest.fn();
  let updateImpl = jest.fn();
  const eq = () => ({ single: singleImpl });
  const select = () => ({ eq });
  const from = jest.fn(() => ({ select, update: updateImpl }));
  return {
    supabase: { auth, from },
    __setSingleImpl: (impl: jest.Mock<any, any, any>) => {
      singleImpl = impl;
    },
    __setUpdateImpl: (impl: jest.Mock<any, any, any>) => {
      updateImpl = impl;
    },
  };
});

const {
  supabase,
  __setSingleImpl,
  __setUpdateImpl,
} = require("../../database/superbase");

// Helper to mock supabase.from().select().eq().single()
function mockSupabaseSingle(returnValue: {
  data:
    | {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        bio: string;
        location: string;
        job_title: string;
        phone: string;
        website: string;
        tech_stacks: string[];
        avatar_url: string;
      }
    | {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
        bio: string;
        location: string;
        job_title: string;
        phone: string;
        website: string;
        tech_stacks: string[];
        avatar_url: string;
      }
    | null;
  error: { message: string } | null;
}) {
  const single = jest.fn().mockResolvedValue(returnValue);
  __setSingleImpl(single);
  return single;
}
// Helper to mock supabase.from().update().eq()
function mockSupabaseUpdateWithEq(returnValue: {
  error: { message: string } | null;
}) {
  const eq = jest.fn().mockResolvedValue(returnValue);
  const update = jest.fn(() => ({ eq }));
  __setUpdateImpl(update);
  return { update, eq };
}

describe("ProfileContext", () => {
  const TestComponent = () => {
    const { profileData, updateProfile, loading, error, refreshProfile } =
      useProfile();
    return (
      <div>
        <span data-testid="firstName">{profileData.firstName}</span>
        <span data-testid="loading">{loading ? "loading" : "not-loading"}</span>
        <span data-testid="error">{error}</span>
        <button onClick={() => updateProfile({ firstName: "Jane" })}>
          Update
        </button>
        <button onClick={refreshProfile}>Refresh</button>
      </div>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("loads profile data on mount", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
    });
    mockSupabaseSingle({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
        bio: "bio",
        location: "loc",
        job_title: "dev",
        phone: "123",
        website: "site",
        tech_stacks: ["js"],
        avatar_url: "pic.png",
      },
      error: null,
    });
    const { getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await waitFor(() =>
      expect(getByTestId("firstName").textContent).toBe("John")
    );
    expect(getByTestId("loading").textContent).toBe("not-loading");
    expect(getByTestId("error").textContent).toBe("");
  });

  it("handles no user on mount", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    const { getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await waitFor(() =>
      expect(getByTestId("loading").textContent).toBe("not-loading")
    );
  });

  it("handles error loading profile", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "1" } } });
    mockSupabaseSingle({ data: null, error: { message: "fail" } });
    const { getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await waitFor(() =>
      expect(getByTestId("error").textContent).toBe(
        "Failed to load profile data"
      )
    );
  });

  it("updates profile data", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "1" } } });
    mockSupabaseUpdateWithEq({ error: null });
    const { getByText, getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await act(async () => {
      getByText("Update").click();
    });
    await waitFor(() =>
      expect(getByTestId("loading").textContent).toBe("not-loading")
    );
  });

  it("handles update error", async () => {
    supabase.auth.getUser.mockResolvedValue({ data: { user: { id: "1" } } });
    mockSupabaseUpdateWithEq({ error: { message: "fail" } });
    const { getByText, getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await act(async () => {
      getByText("Update").click();
    });
    await waitFor(() =>
      expect(getByTestId("error").textContent).toBe("Failed to update profile")
    );
  });

  it("refreshes profile", async () => {
    supabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "1", email: "test@example.com" } },
    });
    mockSupabaseSingle({
      data: {
        id: "1",
        first_name: "John",
        last_name: "Doe",
        email: "test@example.com",
        bio: "bio",
        location: "loc",
        job_title: "dev",
        phone: "123",
        website: "site",
        tech_stacks: ["js"],
        avatar_url: "pic.png",
      },
      error: null,
    });
    const { getByText, getByTestId } = render(
      <ProfileProvider>
        <TestComponent />
      </ProfileProvider>
    );
    await act(async () => {
      getByText("Refresh").click();
    });
    await waitFor(() =>
      expect(getByTestId("firstName").textContent).toBe("John")
    );
  });
});
