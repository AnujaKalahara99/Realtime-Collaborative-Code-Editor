import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../database/superbase";
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

function Signup() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (password.length < 6)
      return { strength: 0, label: "Too short", color: "text-red-500" };
    if (password.length < 8)
      return { strength: 1, label: "Weak", color: "text-orange-500" };
    if (
      password.length < 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password)
    )
      return { strength: 2, label: "Good", color: "text-blue-500" };
    if (
      password.length >= 12 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password)
    )
      return { strength: 3, label: "Strong", color: "text-green-500" };
    return { strength: 1, label: "Weak", color: "text-orange-500" };
  };

  const passwordStrength = getPasswordStrength(password);

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

        <h1 className={`text-2xl font-medium mb-1 ${theme.text}`}>
          Create an account
        </h1>
        <p className={`mb-6 ${theme.textSecondary} text-sm`}>
          Join CodeSync to collaborate on code
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

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className={`block text-sm mb-1.5 ${theme.text}`}
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`w-full px-3 py-2 ${theme.border} border rounded-md ${theme.surface} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className={`block text-sm mb-1.5 ${theme.text}`}
            >
              Email
            </label>
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

          <div>
            <label
              htmlFor="password"
              className={`block text-sm mb-1.5 ${theme.text}`}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className={`w-full px-3 py-2 ${theme.border} border rounded-md ${theme.surface} ${theme.text} focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="••••••••"
            />

            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${passwordStrength.color}`}
                  >
                    {passwordStrength.label}
                  </span>
                  <span className={`text-xs ${theme.textMuted}`}>
                    {password.length} chars
                  </span>
                </div>
                <div
                  className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5`}
                >
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      passwordStrength.strength === 0
                        ? "bg-red-500 w-1/4"
                        : passwordStrength.strength === 1
                        ? "bg-orange-500 w-2/4"
                        : passwordStrength.strength === 2
                        ? "bg-blue-500 w-3/4"
                        : "bg-green-500 w-full"
                    }`}
                  />
                </div>
              </div>
            )}

            <div className={`mt-1.5 text-xs ${theme.textMuted}`}>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li
                  className={
                    password.length >= 6
                      ? "text-green-500 dark:text-green-400"
                      : ""
                  }
                >
                  At least 6 characters
                </li>
                <li
                  className={
                    /[A-Z]/.test(password)
                      ? "text-green-500 dark:text-green-400"
                      : ""
                  }
                >
                  One uppercase letter
                </li>
                <li
                  className={
                    /[0-9]/.test(password)
                      ? "text-green-500 dark:text-green-400"
                      : ""
                  }
                >
                  One number
                </li>
              </ul>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || passwordStrength.strength < 1}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors mt-2 ${
              loading || passwordStrength.strength < 1
                ? "opacity-70 cursor-not-allowed"
                : ""
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
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        {/* Sign In Link */}
        <div className="mt-6 text-center">
          <span className={`text-sm ${theme.textSecondary}`}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 hover:text-blue-400 hover:underline"
            >
              Sign in
            </button>
          </span>
        </div>

        {/* Terms Notice */}
        <div className="mt-6 text-center">
          <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
            By creating an account, you agree to our{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-500 hover:underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;
