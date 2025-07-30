import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../database/superbase";
import { useTheme } from "../ThemeProvider";
import { Mail, Lock, User, AlertCircle } from "lucide-react";
import ThemeToggleButton from "./ThemeToggleBtn";

function Signup() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Create user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    const userEmail = data.user?.email;

    // Add to profiles table
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email: userEmail,
      });

      if (profileError) {
        setError("Account created but profile setup failed");
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.surface}`}
    >
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <h1 className={`text-3xl font-bold ${theme.text}`}>
              Create Account
            </h1>
            <ThemeToggleButton size="medium" />
          </div>
          <p className={`text-sm ${theme.textSecondary}`}>
            Sign up to get started with your workspace
          </p>
        </div>

        {/* Main Card */}
        <div
          className={`${theme.surfaceSecondary} ${theme.border} border p-6 shadow-sm`}
        >
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label
                htmlFor="fullName"
                className={`block text-sm font-medium ${theme.text} mb-2`}
              >
                Full Name
              </label>
              <div className="relative">
                <User
                  size={18}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
                />
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={`w-full pl-10 pr-4 py-3 ${theme.input} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-colors`}
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  className={`w-full pl-10 pr-4 py-3 ${theme.input} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-colors`}
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
                  minLength={6}
                  className={`w-full pl-10 pr-4 py-3 ${theme.input} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${theme.text} transition-colors`}
                  placeholder="Create a strong password"
                />
              </div>
              <p className={`mt-1 text-xs ${theme.textMuted}`}>
                Password must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-3 font-medium transition-colors"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className={`text-sm ${theme.textSecondary}`}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Sign in
              </button>
            </span>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="text-center">
          <p className={`text-xs ${theme.textMuted}`}>
            By creating an account, you agree to our{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-600 transition-colors"
            >
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
