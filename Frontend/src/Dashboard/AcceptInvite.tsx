import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import ThemeToggleButton from "../components/ThemeToggleBtn";
import { useTheme } from "../ThemeProvider";

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
  const navigate = useNavigate();
  const { invitationId } = useParams<{ invitationId: string }>();
  const { theme } = useTheme();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  console.log("Invitation ID:", invitationId);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
  }, []);

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
        `http://localhost:4000/codespaces/accept-invitation/${invitationId}`,
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
      console.log("API response:", data);


      navigate(data.invitation.workspace_id ? `/codeeditor/${data.invitation.workspace_id}` : "/", {
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
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme.surface} relative overflow-hidden`}>
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div
        className={`w-full max-w-lg relative z-10 transform transition-all duration-700 ease-out ${
          showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        {/* Main Card */}
        <div
          className={`rounded-2xl p-8 shadow-2xl backdrop-blur-sm border text-center relative overflow-hidden ${theme.surfaceSecondary} ${theme.border}`}
          style={{
            background: `linear-gradient(135deg, ${theme.surfaceSecondary} 0%, ${theme.surface} 100%)`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <h1 className={`text-2xl font-bold ${theme.text} tracking-tight`}>
                Ready to Collaborate?
              </h1>
            </div>
            <ThemeToggleButton size="small" />
          </div>

          {/* Collaboration Icon */}
          <div className="mb-6 relative">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rotate-12 opacity-20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center">
                <svg 
                  className="w-10 h-10 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-8">
            <p className={`text-lg ${theme.textSecondary} leading-relaxed`}>
              You've been invited to collaborate on a codespace. Click the button below to join the workspace and start coding together.
            </p>
            
            {invitationId && (
              <div className="mt-4 p-3  dark:bg-gray-800/50 rounded-lg">
                <p className={`text-xs ${theme.textSecondary} mb-1`}>Invitation ID:</p>
                <code className={`text-sm font-mono ${theme.text} break-all`}>
                  {invitationId}
                </code>
              </div>
            )}
          </div>
          
          

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleProceed}
              disabled={isLoading || !invitationId}
              className={`
                w-full px-8 py-4 rounded-xl font-semibold text-white
                bg-gradient-to-r from-blue-600 to-purple-600
                hover:from-blue-700 hover:to-purple-700
                transform transition-all duration-200
                hover:scale-[1.02] hover:shadow-xl
                active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                relative overflow-hidden
                ${isLoading ? 'animate-pulse' : ''}
              `}
            >
              {isLoading && (
                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              <span className={isLoading ? 'opacity-50' : ''}>
                {isLoading ? "Processing..." : "🚀 Start Collaborating"}
              </span>
            </button>

           
          </div>

          {/* Status indicator */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${invitationId ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className={theme.textSecondary}>
                {invitationId ? 'Valid invitation detected' : 'No invitation found'}
              </span>
            </div>
          </div>
        </div>

        {/* Additional Info Card */}
        <div
          className={`mt-4 p-4 rounded-xl ${theme.surfaceSecondary} ${theme.border} border text-center transform transition-all duration-700 delay-200 ${
            showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <p className={`text-sm ${theme.textSecondary}`}>
            💡 <strong>Tip:</strong> Make sure you're logged in to access the collaborative workspace
          </p>
        </div>
      </div>
    </div>
  );
};

export default CollaboratePage;

