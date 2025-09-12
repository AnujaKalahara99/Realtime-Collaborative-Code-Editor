import { supabase } from "../database/superbase";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../Contexts/ThemeProvider";
import { AlertCircle, Sun, Moon, Code } from "lucide-react";

// Simple theme toggle button
const ThemeToggleButton = () => {
  const { toggleTheme, isDark, theme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md ${theme.hover} transition-colors`}
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400" />
      ) : (
        <Moon size={16} className="text-slate-600" />
      )}
    </button>
  );
};

function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);


  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${import.meta.env.VITE_AUTH_CALLBACK_URL}`,
      },
    });

    if (error) {
      setError("Failed to sign in with Google");
    }
  };

  const signInWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("Invalid email or password");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className={`h-screen flex ${theme.background}`}>
      {/* Main content */}
      <div className="flex flex-col w-full max-w-md mx-auto justify-center px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className={`${theme.surface} p-2 rounded-md`}>
              <Code size={20} className={theme.text} />
            </div>
            <span className={`text-xl font-semibold ${theme.text}`}>
              RTC-Editor
            </span>
          </div>
          <ThemeToggleButton />
        </div>

        <h1 className={`text-2xl font-medium mb-1 ${theme.text}`}>Sign in</h1>
        <p className={`mb-6 ${theme.textSecondary} text-sm`}>
          Welcome back to CodeSync
        </p>

        {/* Error Message */}
        {error && (
          <div
            className={`mb-4 p-3 bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 rounded-md flex items-center gap-3`}
          >
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
            <span className="text-sm text-red-600 dark:text-red-300">
              {error}
            </span>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={signInWithEmail} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm mb-1.5 ${theme.text}`}
            >
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`w-full px-3 py-2 ${theme.border} border rounded-md ${theme.surface} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor="password" className={`text-sm ${theme.text}`}>
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full px-3 py-2 ${theme.border} border rounded-md ${theme.surface} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className={`flex-grow h-px ${theme.border}`}></div>
          <span className={`px-3 text-xs ${theme.textMuted}`}>
            OR CONTINUE WITH
          </span>
          <div className={`flex-grow h-px ${theme.border}`}></div>
        </div>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          className={`w-full ${theme.surface} ${theme.border} border py-2 px-4 rounded-md flex items-center justify-center space-x-2 ${theme.hover} transition-colors`}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span className={theme.text}>Google</span>
        </button>

        {/* Sign Up Link */}
        <div className="mt-6 text-center">
          <span className={`text-sm ${theme.textSecondary}`}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Sign up
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;
