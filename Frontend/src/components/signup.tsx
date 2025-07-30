// import React, { useState } from 'react';
// import { supabase } from '../database/superbase';

// const Signup: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(false);

//     // Sign up user with Supabase Auth
//     const { data, error: signUpError } = await supabase.auth.signUp({
//       email,
//       password,
//       options: {
//         data: {
//           full_name: fullName,
//           email:email,
//           // Optionally set avatar_url here if available (e.g., from Google OAuth)
//           avatar_url: null, // Will be updated later or via Supabase Storage
//         },
//       },
//     });

//     if (signUpError) {
//       console.error('Signup error:', signUpError);
//       return setError(signUpError.message);
//     }

//     if (data.user) {
//       const { id } = data.user;
//   console.log('User signed up:', id);
//       // Insert profile into `profiles` table
//       const { error: profileError } = await supabase.from('profiles').insert({
//         id,
//         full_name: fullName,
//         email,
//         avatar_url: null, // Set to null or a valid URL if available
//       });

//       if (profileError) {
//         console.error('Profile error:', profileError);
//         return setError(`Sign up succeeded but failed to save profile: ${profileError.message}`);
//       }

//       setSuccess(true);
//     }
//   };

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
//       <h2 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h2>
//       <form onSubmit={handleSignup} className="space-y-4">
//         <input
//           type="text"
//           placeholder="Full Name"
//           value={fullName}
//           onChange={(e) => setFullName(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//         {error && <p className="text-red-600 text-sm">{error}</p>}
//         {success && (
//           <p className="text-green-600 text-sm">Signup successful! Please check your email to verify.</p>
//         )}
//         <button
//           type="submit"
//           className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
//         >
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// };

// export default Signup;


import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../database/superbase";
import { useTheme } from "../ThemeProvider";

function Signup() {
  const navigate = useNavigate();
  const { theme, isDark, toggleTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 1. Create user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error("Signup error:", signUpError.message);
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;
    const userEmail = data.user?.email;

    // 2. Add to profiles table
    if (userId) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: userId,
        full_name: fullName,
        email: userEmail,
      });

      if (profileError) {
        console.error("Profile insert error:", profileError.message);
        setError("Account created but profile setup failed.");
      } else {
        navigate("/dashboard");
      }
    }

    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
      <div className={`${theme.surface} p-8 rounded-xl shadow-2xl w-full max-w-md`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-3xl font-bold text-center ${theme.text}`}>Sign Up</h1>
          <button
            onClick={toggleTheme}
            className={`${theme.surfaceSecondary} p-2 rounded-full ${theme.hover} transition duration-300`}
          >
            {/* Theme toggle icon same as Login */}
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

        {error && (
          <div className={`mb-6 p-4 ${isDark ? 'bg-red-900/80 text-red-200' : 'bg-red-100 text-red-700'} rounded-lg text-center`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="fullName" className={`block text-sm font-medium ${theme.textSecondary}`}>
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className={`block text-sm font-medium ${theme.textSecondary}`}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
              className={`mt-1 w-full px-4 py-3 border ${theme.border} rounded-lg ${theme.surfaceSecondary} ${theme.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Create a strong password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full ${theme.statusBar} ${theme.statusText} py-3 rounded-lg ${theme.hover} transition duration-300 font-semibold text-lg`}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
