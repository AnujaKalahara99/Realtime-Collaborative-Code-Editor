import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { Users, AlertCircle, ArrowRight, Info } from "lucide-react";
import ThemeToggleButton from "../../components/ThemeToggleBtn";
import { useTheme } from "../../Contexts/ThemeProvider";
import { useCodespaceContext } from "../../Contexts/CodespaceContext";

const getToken = () => {
  const storageKey = `sb-${
    import.meta.env.VITE_SUPABASE_PROJECT_ID
  }-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  console.log("getToken sessionData:", sessionData);
  return sessionData?.access_token || "";
};

const getLoginMail = () => {
  const storageKey = `sb-${
    import.meta.env.VITE_SUPABASE_PROJECT_ID
  }-auth-token`;
  const sessionDataString = localStorage.getItem(storageKey);
  const sessionData = JSON.parse(sessionDataString || "null");
  console.log("getLoginMail sessionData:", sessionData);
  return sessionData?.user?.email || "";
};

const CollaboratePage: React.FC = () => {
  const CODESPACE_API_URL = `${import.meta.env.VITE_BACKEND_URL}/codespaces`;

  const navigate = useNavigate();
  const { invitationId } = useParams<{ invitationId: string }>();
  const { theme } = useTheme();
  const { refreshCodespaces } = useCodespaceContext();
  const [invitationEmail, setInvitationEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);

    const getInvitationEmail = async (invitationId: string) => {
      try {
        const response = await fetch(
          `${CODESPACE_API_URL}/accept-invitation-email/${invitationId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: getToken(),
            },
          }
        );
        setInvitationEmail(response.ok ? (await response.json()).email : null);
      } catch (error) {
        console.error("Error fetching invitation email:", error);
      }
    };

    if (invitationId) {
      getInvitationEmail(invitationId);
    }

    return () => clearTimeout(timer);
  }, [CODESPACE_API_URL, invitationId]);

  const handleProceed = async () => {
    if (!invitationId) {
      setError("No invitation ID found in URL");
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

      if (response.status === 401) {
        localStorage.setItem("invitationId", invitationId);
        console.warn("Unauthorized! Redirecting to login.");
        navigate("/login", { state: { invitationId } });
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to accept invitation");
      }

      const data = await response.json();
      console.log("API response22:", data.invitation.workspace_id);

      await refreshCodespaces();

      navigate(
        data.invitation.workspace_id
          ? `/codeeditor/${data.invitation.workspace_id}`
          : "/",
        {
          state: { invitationId },
        }
      );
    } catch (err) {
      setError("An error occurred while processing your request");
      console.error("Error during API call:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loginEmail = getLoginMail();
  const handleLoginRedirect = () => {
    localStorage.setItem("invitationId", invitationId || "");
    navigate("/login", { state: { invitationId } });
  };

  const renderActionButton = () => {
    if (!loginEmail) {
      return (
        <button
          onClick={handleLoginRedirect}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium
            text-white bg-blue-600 hover:bg-blue-700
            transition-colors duration-200
            flex items-center justify-center gap-2
          `}
        >
          <ArrowRight className="w-4 h-4" />
          Login with invitation email
        </button>
      );
    } else if (loginEmail === invitationEmail) {
      return (
        <button
          onClick={handleProceed}
          disabled={isLoading || !invitationId}
          className={`
            w-full px-4 py-2 rounded-md text-sm font-medium
            text-white bg-blue-600 hover:bg-blue-700
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            flex items-center justify-center gap-2
            ${isLoading ? "cursor-wait" : ""}
          `}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Processing...
            </>
          ) : (
            <>
              <ArrowRight className="w-4 h-4" />
              Proceed
            </>
          )}
        </button>
      );
    } else {
      return (
        <div className="space-y-3">
          <div
            className={`p-3 ${theme.surface} border border-yellow-500 rounded-md mb-3`}
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
              <p className={`text-sm ${theme.text}`}>
                You're logged in as{" "}
                <span className="font-semibold">{loginEmail}</span>, but this
                invitation is for{" "}
                <span className="font-semibold">{invitationEmail}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleLoginRedirect}
            className={`
              w-full px-4 py-2 rounded-md text-sm font-medium
              text-white bg-blue-600 hover:bg-blue-700
              transition-colors duration-200
              flex items-center justify-center gap-2
            `}
          >
            <ArrowRight className="w-4 h-4" />
            Login with invitation email
          </button>
        </div>
      );
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.surface}`}
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-700 ease-out ${
          showContent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}
      >
        {/* Main Card */}
        <div
          className={`rounded-lg p-6 shadow-lg border ${theme.surfaceSecondary} ${theme.border}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h1 className={`text-xl font-semibold ${theme.text}`}>
                Accept Invitation
              </h1>
            </div>
            <ThemeToggleButton size="small" />
          </div>

          {/* Collaboration Icon */}
          <div className="mb-6 flex justify-center">
            <div
              className={`w-16 h-16 ${theme.surface} border ${theme.border} rounded-lg flex items-center justify-center`}
            >
              <Users className={`w-8 h-8 ${theme.text}`} />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className={`mb-4 p-3 ${theme.surface} border border-red-500 rounded-md`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <p
              className={`text-sm ${theme.textSecondary} leading-relaxed mb-4`}
            >
              You've been invited to collaborate on a codespace. Click the
              button below to join the workspace and start coding together.
            </p>

            {invitationEmail && (
              <div
                className={`p-3 ${theme.surface} border ${theme.border} rounded-md mb-3`}
              >
                <p
                  className={`text-xs ${theme.textSecondary} mb-2 uppercase tracking-wide`}
                >
                  Invitation Email
                </p>
                <code
                  className={`text-sm font-mono ${theme.text} block break-all`}
                >
                  {invitationEmail}
                </code>
              </div>
            )}

            {invitationId && (
              <div
                className={`p-3 ${theme.surface} border ${theme.border} rounded-md`}
              >
                <p
                  className={`text-xs ${theme.textSecondary} mb-2 uppercase tracking-wide`}
                >
                  Invitation ID
                </p>
                <code
                  className={`text-sm font-mono ${theme.text} block break-all`}
                >
                  {invitationId}
                </code>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">{renderActionButton()}</div>

          {/* Status indicator */}
          <div className={`mt-4 pt-4 border-t ${theme.border}`}>
            <div className="flex items-center gap-2 text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  invitationId ? "bg-green-500" : "bg-red-500"
                }`}
              ></div>
              <span className={theme.textSecondary}>
                {invitationId
                  ? "Valid invitation detected"
                  : "No invitation found"}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div
          className={`mt-3 p-3 rounded-lg ${theme.surface} border ${
            theme.border
          } 
      transform transition-all duration-700 delay-200 ${
        showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
        >
          <div className="flex items-start gap-2">
            <Info
              className={`w-4 h-4 ${theme.textSecondary} mt-0.5 flex-shrink-0`}
            />
            <p className={`text-xs ${theme.textSecondary}`}>
              Make sure you're logged in to access the collaborative workspace
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaboratePage;
