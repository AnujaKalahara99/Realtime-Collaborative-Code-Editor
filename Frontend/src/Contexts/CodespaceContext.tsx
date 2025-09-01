import React, { createContext, useContext, useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import {
  type Codespace,
  type CodespaceDetails,
} from "../App/Dashboard/codespace.types";

interface CodespaceContextType {
  codespaces: Codespace[];
  loading: boolean;
  error: string | null;
  selectedCodespace: CodespaceDetails | null;
  createCodespace: (workspaceName: string) => Promise<boolean>;
  deleteCodespace: (id: string) => Promise<boolean>;
  shareCodespaceByEmail: (
    id: string,
    email: string,
    role: string
  ) => Promise<boolean>;
  editCodespace: (id: string, newName: string) => Promise<boolean>;
  selectCodespace: (id: string) => void;
  clearSelectedCodespace: () => void;
  updateCodespaceDetails: (
    details: Partial<CodespaceDetails>
  ) => Promise<boolean>;
}

const initialCodespaceContext: CodespaceContextType = {
  codespaces: [],
  loading: false,
  error: null,
  selectedCodespace: null,
  createCodespace: async () => false,
  deleteCodespace: async () => false,
  shareCodespaceByEmail: async () => false,
  editCodespace: async () => false,
  selectCodespace: () => {},
  clearSelectedCodespace: () => {},
  updateCodespaceDetails: async () => false,
};

const CodespaceContext = createContext<CodespaceContextType>(
  initialCodespaceContext
);

export const CodespaceProvider: React.FC<{
  session: Session | null;
  children: React.ReactNode;
}> = ({ session, children }) => {
  const [codespaces, setCodespaces] = useState<Codespace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCodespace, setSelectedCodespace] =
    useState<CodespaceDetails | null>(null);

  const CODESPACE_API_URL = `${import.meta.env.VITE_BACKEND_URL}/codespaces`;
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.email ||
    "Anonymous";

  const getToken = () => {
    if (session?.access_token) return session.access_token;

    const storageKey = `sb-${
      import.meta.env.VITE_SUPABASE_PROJECT_ID
    }-auth-token`;
    const sessionData = JSON.parse(localStorage.getItem(storageKey) || "null");
    return sessionData?.access_token || "";
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
    return `${formattedDate}, ${formattedTime}`;
  };

  useEffect(() => {
    if (!session) {
      setError("No active session. Please log in.");
      return;
    }

    const fetchCodespaces = async () => {
      const result = await handleApiRequest(
        CODESPACE_API_URL,
        "GET",
        undefined,
        "Failed to fetch codespaces"
      );

      if (result.success && result.data?.codespaces) {
        const codespaceList = result.data.codespaces.map((item: Codespace) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          lastModified: formatDateTime(item.lastModified),
          owner: userName,
        }));
        setCodespaces(codespaceList);
      }
    };

    fetchCodespaces();
  }, [session]);

  const handleApiRequest = async (
    endpoint: string,
    method: string,
    body?: object,
    errorMessage = "API request failed"
  ) => {
    if (!session) {
      setError("You must be logged in");
      return { success: false };
    }

    setLoading(true);

    try {
      const token = getToken();
      if (!token) {
        setError("No authentication token available");
        setLoading(false);
        return { success: false };
      }

      const headers: HeadersInit = {
        Authorization: token,
        "Content-Type": "application/json",
      };

      const requestOptions: RequestInit = {
        method,
        headers,
        ...(body && { body: JSON.stringify(body) }),
      };

      const response = await fetch(endpoint, requestOptions);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setError(`Server error: ${errorData.message || response.status}`);
        setLoading(false);
        return { success: false };
      }

      const data = await response.json().catch(() => ({}));
      setLoading(false);
      return { success: true, data };
    } catch (error) {
      console.error(errorMessage, error);
      setError(errorMessage);
      setLoading(false);
      return { success: false };
    }
  };

  const createCodespace = async (workspaceName: string): Promise<boolean> => {
    if (!workspaceName.trim()) {
      setError("Workspace name cannot be empty");
      return false;
    }

    const result = await handleApiRequest(
      CODESPACE_API_URL,
      "POST",
      { name: workspaceName },
      "Failed to create codespace"
    );

    if (result.success && result.data?.codespace) {
      const newWorkspace: Codespace = {
        id: result.data.codespace.id,
        name: result.data.codespace.name,
        lastModified: formatDateTime(result.data.codespace.lastModified),
        created_at: result.data.codespace.created_at,
        owner: userName,
        role: result.data.codespace.role,
      };

      setCodespaces((prev) => [newWorkspace, ...prev]);
      return true;
    }
    return false;
  };

  const deleteCodespace = async (id: string): Promise<boolean> => {
    const result = await handleApiRequest(
      `${CODESPACE_API_URL}/${id}`,
      "DELETE",
      undefined,
      "Failed to delete codespace"
    );

    if (result.success) {
      setCodespaces((prev) => prev.filter((c) => c.id !== id));
      return true;
    }
    return false;
  };

  const shareCodespaceByEmail = async (
    id: string,
    email: string,
    role: string
  ): Promise<boolean> => {
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return false;
    }

    const result = await handleApiRequest(
      `${CODESPACE_API_URL}/${id}/sharebyemail`,
      "POST",
      { email: email.trim(), role: role.trim() },
      "Failed to share codespace"
    );

    return result.success;
  };

  const editCodespace = async (
    id: string,
    newName: string
  ): Promise<boolean> => {
    if (!newName?.trim()) {
      setError("Codespace name cannot be empty");
      return false;
    }

    const result = await handleApiRequest(
      `${CODESPACE_API_URL}/${id}`,
      "PUT",
      { name: newName.trim() },
      "Failed to edit codespace"
    );

    if (result.success) {
      setCodespaces((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: newName.trim() } : c))
      );
      return true;
    }
    return false;
  };

  const selectCodespace = async (id: string) => {
    const result = await handleApiRequest(
      `${CODESPACE_API_URL}/${id}`,
      "GET",
      undefined,
      "Failed to fetch codespace details"
    );

    if (result.success && result.data?.codespace) {
      setSelectedCodespace(result.data.codespace);
    }
  };

  const clearSelectedCodespace = () => {
    setSelectedCodespace(null);
  };

  const updateCodespaceDetails = async (
    details: Partial<CodespaceDetails>
  ): Promise<boolean> => {
    if (!selectedCodespace) {
      setError("No codespace selected");
      return false;
    }

    const result = await handleApiRequest(
      `${CODESPACE_API_URL}/${selectedCodespace.id}/details`,
      "PUT",
      details,
      "Failed to update codespace details"
    );

    if (result.success && result.data?.codespace) {
      setSelectedCodespace(result.data.codespace);
      return true;
    }
    return false;
  };

  return (
    <CodespaceContext.Provider
      value={{
        codespaces,
        loading,
        error,
        selectedCodespace,
        createCodespace,
        deleteCodespace,
        shareCodespaceByEmail,
        editCodespace,
        selectCodespace,
        clearSelectedCodespace,
        updateCodespaceDetails,
      }}
    >
      {children}
    </CodespaceContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCodespaceContext = () => {
  const context = useContext(CodespaceContext);
  return context;
};
