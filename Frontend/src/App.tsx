// import "./App.css";
// import CodeEditorPage from "./CodeEditor/Page";
// import { ThemeProvider } from "./ThemeProvider";
// import React from "react";
// import Login from "./components/login";
// import Signup from "./components/signup";
// import Dashboard from "./components/dashboard";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// function App() {
//    const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });

//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       setSession(session);
//        if (session) upsertProfile(session.user);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   async function upsertProfile(user: any) {
//     const { id, user_metadata, email } = user;
//     const full_name = user_metadata.full_name || "";
//     const avatar_url = user_metadata.avatar_url || "";

//     const { error } = await supabase
//       .from("profiles")
//       .upsert({
//         id,
//         full_name,
//         email,
//         avatar_url,
//       }, { onConflict: "id" });

//     if (error) console.error("Error upserting profile:", error.message);
//   }

//   return (
//     <div>
//       <ThemeProvider>
//         <Router>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/dashboard" element={<Dashboard />} />
//             <Route path="/codeeditor" element={<CodeEditorPage />} />
//              <Route path="/" element={<Login />} />
//           </Routes>
//         </Router>
//       </ThemeProvider>
//     </div>
//   );
// }

// export default App;


import "./App.css";
import { useState, useEffect } from "react";
import CodeEditorPage from "./CodeEditor/Page";
import { ThemeProvider } from "./ThemeProvider";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./components/dashboard";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./database/superbase";
function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) upsertProfile(session.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function upsertProfile(user) {
    const { id, user_metadata, email } = user;
    const full_name = user_metadata.full_name || "";
    const avatar_url = user_metadata.avatar_url || "";

    const { error } = await supabase.from("profiles")
      .upsert({ id, full_name, email, avatar_url }, { onConflict: "id" });

    if (error) console.error("Error upserting profile:", error.message);
  }

  function ProtectedRoute({ children }) {
    return session ? children : <Navigate to="/login" />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard session={session} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/codeeditor"
            element={
              <ProtectedRoute>
                <CodeEditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;