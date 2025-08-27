import React, { useState } from "react";
import { useNavigate, useParams } from "react-router";
import ThemeToggleButton from "../../components/ThemeToggleBtn";
import { useTheme } from "../../Contexts/ThemeProvider";

const getToken = () => {
  const storageKey = `sb-${
    import.meta.env.VITE_SUPABASE_PROJECT_ID
  }-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  console.log("getToken sessionData:", sessionData);
  return sessionData?.access_token || "";
};

const CollaboratePage: React.FC = () => {
  // const CODESPACE_API_URL = "http://localhost:4000/codespaces";
  const CODESPACE_API_URL = "https://www.rtc-app.linkpc.net/codespaces";

  const navigate = useNavigate();
  const { invitationId } = useParams<{ invitationId: string }>();
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Debugging: Log the invitationId
  console.log("Invitation ID:", invitationId);

  const handleProceed = async () => {
    if (!invitationId) {
      setError("No invitation ID found in URL");
      console.error("No invitationId provided in URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${CODESPACE_API_URL}/accept-invitation/${invitationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: getToken(),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const data = await response.json();
      console.log("API response:", data);

      navigate(data.codespaceId ? `/codespace/${data.codespaceId}` : "/", {
        state: { invitationId },
      });
    } catch (err) {
      setError("An error occurred while processing your request");
      console.error("Error during API call:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center justify-center h-screen p-6 ${theme.surface}`}
    >
      <div
        className={`w-full max-w-md rounded-lg p-8 shadow-md text-center border ${theme.surfaceSecondary} ${theme.border}`}
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${theme.text}`}>
            Ready to Collaborate?
          </h1>
          <ThemeToggleButton size="small" />
        </div>

        {error && <p className={`mb-4 text-red-500`}>{error}</p>}

        <p className={`mb-8 ${theme.textSecondary}`}>
          Click the button below to start collaborating on the codespace.
        </p>

        <button
          onClick={handleProceed}
          className={`w-full px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium ${
            isLoading || !invitationId ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={isLoading || !invitationId}
        >
          {isLoading ? "Processing..." : "Proceed to Collaborate"}
        </button>
      </div>
    </div>
  );
};

export default CollaboratePage;
