import { supabase } from "../database/superbase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../ThemeProvider";
import { Mail, Lock, AlertCircle } from "lucide-react";
import ThemeToggleButton from "./ThemeToggleBtn";

function Login() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if session exists
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkSession();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
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
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.surface}`}
    >
      <div className={`w-full max-w-md space-y-8`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <h1 className={`text-3xl font-bold ${theme.text}`}>Welcome</h1>
            <ThemeToggleButton size="medium" />
          </div>
          <p className={`text-sm ${theme.textSecondary}`}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Main Card */}
        <div
          className={`${theme.surfaceSecondary} ${theme.border} border p-6 shadow-sm`}
        >
          {/* Error Message */}
          {error && (
            <div
              className={`mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2`}
            >
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>
          )}

          {/* Email Form */}
          <form onSubmit={signInWithEmail} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${theme.text} mb-2`}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-colors`}
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium ${theme.text} mb-2`}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-colors`}
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div
              className={`flex-1 h-px ${theme.border} bg-current opacity-20`}
            ></div>
            <span className={`px-3 text-sm ${theme.textMuted}`}>or</span>
            <div
              className={`flex-1 h-px ${theme.border} bg-current opacity-20`}
            ></div>
          </div>

          {/* Google Button */}
          <button
            onClick={signInWithGoogle}
            className={`w-full ${theme.surface} ${theme.border} border ${theme.text} py-3 ${theme.hover} transition-colors font-medium flex items-center justify-center gap-3`}
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
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <span className={`text-sm ${theme.textSecondary}`}>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Sign up
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
