// import { supabase } from "../database/superbase";
// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useTheme } from "../ThemeProvider"; // Adjust path as needed

// function Login() {
//   const navigate = useNavigate();
//   const { theme, isDark, toggleTheme } = useTheme();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       if (session) navigate("/dashboard");
//     });
//   }, [navigate]);

//   const signInWithGoogle = async () => {
//     const { error } = await supabase.auth.signInWithOAuth({
//       provider: "google",
//     });
//     if (error) {
//       console.error("Google login error:", error.message);
//       setError("Failed to sign in with Google");
//     }
//   };

//   const signInWithEmail = async (e) => {
//     e.preventDefault();
//     setError(null);
//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });
//     if (error) {
//       console.error("Email login error:", error.message);
//       setError(error.message);
//     } else {
//       navigate("/dashboard");
//     }
//   };

//   return (
//     <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
//       <div className={`${theme.surface} p-8 rounded-xl shadow-2xl w-full max-w-md`}>
//         <div className="flex justify-between items-center mb-6">
//           <h1 className={`text-3xl font-bold text-center ${theme.text}`}>Sign In</h1>
//           <button
//             onClick={toggleTheme}
//             className={`${theme.surfaceSecondary} p-2 rounded-full ${theme.hover} transition duration-300`}
//             aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
//           >
//             {isDark ? (
//               <svg className="w-6 h-6" fill="none" stroke={theme.text} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
//               </svg>
//             ) : (
//               <svg className="w-6 h-6" fill="none" stroke={theme.text} viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
//               </svg>
//             )}
//           </button>
//         </div>

//         {error && (
//           <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/80 text-red-200' : 'bg-red-100 text-red-700'} rounded-lg text-center backdrop-blur-sm`}>
//             {error}
//           </div>
//         )}

//         <form onSubmit={signInWithEmail} className="space-y-6">
//           <div>
//             <label htmlFor="email" className={`block text-sm font-medium ${theme.textSecondary}`}>
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
//               placeholder="Enter your email"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className={`block text-sm font-medium ${theme.textSecondary}`}>
//               Password
//             </label>
//             <input
//               type="password"
//               id="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
//               placeholder="Enter your password"
//             />
//           </div>

//           <button
//             type="submit"
//             className={`w-full ${theme.statusBar} ${theme.statusText} py-3 rounded-lg ${theme.hover} transition duration-300 font-semibold text-lg`}
//           >
//             Sign in with Email
//           </button>
//         </form>

//         <div className="my-8 flex items-center">
//           <hr className={`flex-grow ${theme.border}`} />
//           <span className={`mx-4 ${theme.textMuted} text-sm`}>OR</span>
//           <hr className={`flex-grow ${theme.border}`} />
//         </div>

//         <button
//           onClick={signInWithGoogle}
//           className={`w-full ${theme.surface} border ${theme.border} ${theme.text} py-3 rounded-lg ${theme.hover} transition duration-300 flex items-center justify-center gap-3 font-semibold text-lg`}
//         >
//           <svg className="w-6 h-6" viewBox="0 0 48 48">
//             <path
//               fill="#4285F4"
//               d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
//             />
//             <path
//               fill="#34A853"
//               d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
//             />
//             <path
//               fill="#FBBC05"
//               d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
//             />
//             <path
//               fill="#EA4335"
//               d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
//             />
//           </svg>
//           Sign in with Google
//         </button>
//       </div>
//     </div>
//   );
// }

// export default Login;


import { supabase } from "../database/superbase";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../ThemeProvider";

function Login() {
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if session exists
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) navigate("/dashboard");
    };
    checkSession();
  }, [navigate]);

  const signInWithGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) {
      console.error("Google login error:", error.message);
      setError("Failed to sign in with Google");
    }
  };

  const signInWithEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      console.error("Email login error:", error.message);
      setError("Invalid email or password. Please try again.");
    } else {
      navigate("/dashboard");
    }
  };

  const handleSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
      <div className={`${theme.surface} p-8 rounded-xl shadow-2xl w-full max-w-md`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold text-center ${theme.text}`}>Sign In</h1>
          <button
            onClick={toggleTheme}
            className={`${theme.surfaceSecondary} p-2 rounded-full ${theme.hover} transition duration-300`}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
          >
            {isDark ? (
              <svg className="w-6 h-6" fill="none" stroke={theme.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke={theme.text} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/80 text-red-200' : 'bg-red-100 text-red-700'} rounded-lg text-center backdrop-blur-sm`}>
            {error}
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={signInWithEmail} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme.textSecondary}`}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className={`block text-sm font-medium ${theme.textSecondary}`}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200`}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${theme.statusBar} ${theme.statusText} py-3 rounded-lg ${theme.hover} transition duration-300 font-semibold text-lg`}
          >
            {loading ? "Signing in..." : "Sign in with Email"}
          </button>
        </form>

        {/* Sign Up Button */}
        <button
          onClick={handleSignUp}
          className={`w-full mt-4 ${theme.surface} border ${theme.border} ${theme.text} py-3 rounded-lg ${theme.hover} transition duration-300 font-semibold text-lg`}
        >
          Sign Up
        </button>

        {/* OR divider */}
        <div className="my-8 flex items-center">
          <hr className={`flex-grow ${theme.border}`} />
          <span className={`mx-4 ${theme.textMuted} text-sm`}>OR</span>
          <hr className={`flex-grow ${theme.border}`} />
        </div>

        {/* Google Button */}
        <button
          onClick={signInWithGoogle}
          className={`w-full ${theme.surface} border ${theme.border} ${theme.text} py-3 rounded-lg ${theme.hover} transition duration-300 flex items-center justify-center gap-3 font-semibold text-lg`}
        >
          <svg className="w-6 h-6" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#34A853" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.28-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#EA4335" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;