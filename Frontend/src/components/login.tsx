import { supabase } from "../database/superbase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTheme } from "../Contexts/ThemeProvider";
import { Mail, Lock, AlertCircle, Sun, Moon, Code, Zap } from "lucide-react";

type ThemeToggleButtonProps = {
  size?: "small" | "medium" | "large";
};

const iconSizes = {
  small: 14,
  medium: 20,
  large: 28,
};

const ThemeToggleButton = ({ size = "medium" }: ThemeToggleButtonProps) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const iconSize = iconSizes[size];

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-xl ${theme.hover} transition-all duration-300 transform hover:scale-110 shadow-lg backdrop-blur-sm`}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <div className="relative">
        {isDark ? (
          <Sun size={iconSize} className="text-amber-400" />
        ) : (
          <Moon size={iconSize} className="text-slate-600" />
        )}
      </div>
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
      // options: { redirectTo: "http://localhost:5173/login" },
      options: {
        redirectTo:
          "https://68aee7a468a50f41d684ab8b--rtc-editor.netlify.app/login",
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
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.surface} relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-violet-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className={`w-full max-w-md space-y-8 relative z-10`}>
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
                  <Code size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h1
                  className={`text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent`}
                >
                  CodeSync
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  <Zap size={12} className="text-blue-500" />
                  <span
                    className={`text-xs ${theme.textSecondary} font-medium`}
                  >
                    Sync. Code. Collaborate.
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <ThemeToggleButton size="medium" />
            </div>
          </div>
          <p className={`text-lg ${theme.textSecondary} font-medium`}>
            Welcome back to your coding workspace
          </p>
        </div>

        {/* Main Card */}
        <div
          className={`${theme.surfaceSecondary} ${theme.border} border backdrop-blur-xl bg-opacity-80 rounded-2xl p-8 shadow-2xl relative`}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>

          <div className="relative z-10">
            {/* Error Message */}
            {error && (
              <div
                className={`mb-6 p-4 bg-red-50/90 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 backdrop-blur-sm`}
              >
                <div className="flex-shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {error}
                </span>
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={signInWithEmail} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className={`block text-sm font-semibold ${theme.text}`}
                >
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={20}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} group-focus-within:text-blue-500 transition-colors duration-200`}
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-4 ${theme.border} border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${theme.text} ${theme.surface} transition-all duration-200 hover:border-blue-300`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="password"
                  className={`block text-sm font-semibold ${theme.text}`}
                >
                  Password
                </label>
                <div className="relative group">
                  <Lock
                    size={20}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} group-focus-within:text-blue-500 transition-colors duration-200`}
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-4 ${theme.border} border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 ${theme.text} ${theme.surface} transition-all duration-200 hover:border-blue-300`}
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 hover:from-blue-600 hover:via-purple-600 hover:to-cyan-600 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Signing you in...
                    </>
                  ) : (
                    <>
                      <Code size={18} />
                      Sign Into CodeSync
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Divider */}
            <div className="my-8 flex items-center">
              <div
                className={`flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${theme.textMuted}`}
              ></div>
              <span className={`px-4 text-sm font-medium ${theme.textMuted}`}>
                or continue with
              </span>
              <div
                className={`flex-1 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-20 ${theme.textMuted}`}
              ></div>
            </div>

            {/* Google Button */}
            <button
              onClick={signInWithGoogle}
              className={`w-full ${theme.surface} ${theme.border} border-2 ${theme.text} py-4 ${theme.hover} transition-all duration-300 font-semibold flex items-center justify-center gap-3 rounded-xl hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
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
            <div className="mt-8 text-center">
              <span className={`text-sm ${theme.textSecondary}`}>
                New to CodeSync?{" "}
                <button
                  onClick={() => navigate("/signup")}
                  className="text-blue-500 hover:text-blue-400 font-semibold transition-colors duration-200 hover:underline"
                >
                  Create your account
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className={`text-xs ${theme.textMuted}`}>
            By signing in, you agree to our{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
