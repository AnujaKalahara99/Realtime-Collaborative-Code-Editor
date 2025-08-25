import "./App.css";
import { useState, useEffect, useRef } from "react";
import CodeEditorPage from "./CodeEditor/Page";
import { ThemeProvider } from "./ThemeProvider";
import { ProfileProvider } from "./contexts/ProfileContext";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./Dashboard/Dashboard";
import CodespaceInvitation from "./Dashboard/AcceptInvite";
import ProfilePage from "./Dashboard/profile";
import SettingsPage from "./Dashboard/ProfileSetting";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { supabase } from "./database/superbase";
import { type Session, type User } from "@supabase/supabase-js";

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const lastTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentToken = session?.access_token;

      if (lastTokenRef.current !== currentToken) {
        console.log("Session updated:", session);
        lastTokenRef.current = currentToken;
        setSession(session);
        if (session) upsertProfile(session.user);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

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
      <ProfileProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {session && <Dashboard session={session} />}
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
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
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
