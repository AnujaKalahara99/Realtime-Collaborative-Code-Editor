
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../database/superbase";
import { useTheme } from "../ThemeProvider";
import { Mail, Lock, User, AlertCircle, Sun, Moon, Code, Zap, UserPlus, Shield, CheckCircle2 } from "lucide-react";

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
    if (password.length < 6) return { strength: 0, label: "Too short", color: "text-red-500" };
    if (password.length < 8) return { strength: 1, label: "Weak", color: "text-orange-500" };
    if (password.length < 12 && /[A-Z]/.test(password) && /[0-9]/.test(password)) 
      return { strength: 2, label: "Good", color: "text-blue-500" };
    if (password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*]/.test(password)) 
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
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${theme.surface} relative overflow-hidden`}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-xl blur opacity-75"></div>
                <div className="relative bg-gradient-to-r from-emerald-500 to-blue-600 p-3 rounded-xl">
                  <Code size={24} className="text-white" />
                </div>
              </div>
              <div className="flex flex-col items-start">
                <h1 className={`text-4xl font-bold bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                  CodeSync
                </h1>
                <div className="flex items-center space-x-1 mt-1">
                  <UserPlus size={12} className="text-emerald-500" />
                  <span className={`text-xs ${theme.textSecondary} font-medium`}>
                    Join the Community
                  </span>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <ThemeToggleButton size="medium" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold ${theme.text}`}>Create Your Account</h2>
            <p className={`text-lg ${theme.textSecondary} font-medium`}>
              Start your coding journey with CodeSync
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={`${theme.surfaceSecondary} rounded-xl p-4 border ${theme.border} backdrop-blur-sm`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-2 rounded-lg">
                <Code size={16} className="text-white" />
              </div>
              <span className={`text-xs font-medium ${theme.text}`}>Sync Code</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <Zap size={16} className="text-white" />
              </div>
              <span className={`text-xs font-medium ${theme.text}`}>Fast Deploy</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="bg-gradient-to-br from-emerald-500 to-green-500 p-2 rounded-lg">
                <Shield size={16} className="text-white" />
              </div>
              <span className={`text-xs font-medium ${theme.text}`}>Secure</span>
            </div>
          </div>
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
              <div className={`mb-6 p-4 bg-red-50/90 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3 backdrop-blur-sm`}>
                <div className="flex-shrink-0">
                  <AlertCircle size={20} className="text-red-500" />
                </div>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">
                  {error}
                </span>
              </div>
            )}

            {/* Signup Form */}
            <form onSubmit={handleSignup} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="fullName"
                  className={`block text-sm font-semibold ${theme.text}`}
                >
                  Full Name
                </label>
                <div className="relative group">
                  <User
                    size={20}
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} group-focus-within:text-emerald-500 transition-colors duration-200`}
                  />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full pl-12 pr-4 py-4 ${theme.border} border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 ${theme.text} ${theme.surface} transition-all duration-200 hover:border-emerald-300`}
                    placeholder="Enter your full name"
                  />
                  {fullName && (
                    <CheckCircle2 size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500" />
                  )}
                </div>
              </div>

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
                  {email.includes('@') && (
                    <CheckCircle2 size={20} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-emerald-500" />
                  )}
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
                    className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${theme.textMuted} group-focus-within:text-purple-500 transition-colors duration-200`}
                  />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className={`w-full pl-12 pr-4 py-4 ${theme.border} border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 ${theme.text} ${theme.surface} transition-all duration-200 hover:border-purple-300`}
                    placeholder="Create a strong password"
                  />
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${passwordStrength.color}`}>
                        Password Strength: {passwordStrength.label}
                      </span>
                      <span className={`text-xs ${theme.textMuted}`}>
                        {password.length}/12+ chars
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          passwordStrength.strength === 0 ? 'bg-red-500 w-1/4' :
                          passwordStrength.strength === 1 ? 'bg-orange-500 w-2/4' :
                          passwordStrength.strength === 2 ? 'bg-blue-500 w-3/4' :
                          'bg-green-500 w-full'
                        }`}
                      />
                    </div>
                  </div>
                )}
                
                <div className={`text-xs ${theme.textMuted} space-y-1`}>
                  <p>Password requirements:</p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2">
                    <li className={password.length >= 6 ? 'text-emerald-500' : ''}>At least 6 characters</li>
                    <li className={/[A-Z]/.test(password) ? 'text-emerald-500' : ''}>One uppercase letter</li>
                    <li className={/[0-9]/.test(password) ? 'text-emerald-500' : ''}>One number</li>
                  </ul>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || passwordStrength.strength < 1}
                className="w-full bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-500 hover:from-emerald-600 hover:via-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <span className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      We’ve sent an invitation email to your account. Please check your inbox and click the verification link to accept the invitation and log in to CodeSync
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Create CodeSync Account
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-8 text-center">
              <span className={`text-sm ${theme.textSecondary}`}>
                Already part of CodeSync?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-blue-500 hover:text-blue-400 font-semibold transition-colors duration-200 hover:underline"
                >
                  Sign in to your account
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* Terms Notice */}
        <div className="text-center">
          <p className={`text-xs ${theme.textMuted} leading-relaxed`}>
            By creating an account, you agree to our{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="text-blue-500 hover:text-blue-400 transition-colors font-medium"
            >
              Privacy Policy
            </a>
            <br />
            We respect your privacy and protect your data.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;