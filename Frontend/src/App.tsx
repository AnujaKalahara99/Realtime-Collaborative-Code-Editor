import "./App.css";
import { useState, useEffect, useRef } from "react";
import CodeEditorPage from "./CodeEditor/Page";
import { ThemeProvider } from "./ThemeProvider";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./Dashboard/Dashboard";
import CodespaceInvitation from "./Dashboard/AcceptInvite";
import Homepage from "./components/Homepage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { supabase } from "./database/superbase";
import { type Session, type User } from "@supabase/supabase-js";

function App() {
  // console.log("App component rendered");

  const [session, setSession] = useState<Session | null>(null);
  // prevent duplicate updates based on the access token.
  const lastTokenRef = useRef<string | undefined>();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const currentToken = session?.access_token;

      // Only update if token actually changed
      if (lastTokenRef.current !== currentToken) {
        console.log("Session updated:", session);
        lastTokenRef.current = currentToken;
        setSession(session);
        if (session) upsertProfile(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    console.log("Session changed on App");
  }, [session]);

  async function upsertProfile(user: User) {
    const { id, user_metadata, email } = user;
    const full_name = user_metadata.full_name || "";
    const avatar_url = user_metadata.avatar_url || "";

    const { error } = await supabase
      .from("profiles")
      .upsert({ id, full_name, email, avatar_url }, { onConflict: "id" });

    if (error) console.error("Error upserting profile:", error.message);
  }

  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return session ? children : <Navigate to="/login" />;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/homepage" element={<Homepage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {session && <Dashboard session={session} />}
              </ProtectedRoute>
            }
          />
          <Route path="/codeeditor/:id" element={<CodeEditorPage />} />
          <Route
            path="/codespace/sharebyemail/:invitationId"
            element={<CodespaceInvitation />}
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
