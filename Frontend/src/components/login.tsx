// // src/components/Login.tsx
// import React from 'react'
// import { supabase } from '../superbase'

// const Login = () => {
// const handleGoogleLogin = async () => {
//   const { error } = await supabase.auth.signInWithOAuth({
//     provider: 'google',
//     options: {
//       redirectTo: 'http://localhost:5173/dashboard', // or your deployed URL
//     },
//   })
//   console.log(handleGoogleLogin)
//   if (error) console.error('Google login error:', error.message)
// }

//   return (
//     <div>
//       <h2>Login</h2>
//       <button onClick={handleGoogleLogin}>Login with Google</button>
//     </div>
//   )
// }

// export default Login
import { supabase } from "../superbase";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });
  }, [navigate]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });
    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <button onClick={signInWithGoogle}>Sign in with Google</button>
    </div>
  );
}

export default Login;