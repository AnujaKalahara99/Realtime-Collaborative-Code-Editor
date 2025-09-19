
import "./App.css";
import { useState, useEffect, useRef } from "react";
import CodeEditorPage from "./App/CodeEditor/Page";
import { ThemeProvider } from "./Contexts/ThemeProvider";
import { ProfileProvider } from "./Contexts/ProfileContext";
import Login from "./components/login";
import Signup from "./components/signup";
import Dashboard from "./App/Dashboard/Dashboard";
import CodespaceInvitation from "./App/Dashboard/AcceptInvite";
import ProfilePage from "./App/Dashboard/profile";
import SettingsPage from "./App/Dashboard/ProfileSetting";
import Homepage from "./App/Home/Homepage";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { supabase } from "./database/superbase";
import { type Session, type User } from "@supabase/supabase-js";
import { CodespaceProvider } from "./Contexts/CodespaceContext";
import { EditorCollaborationProvider } from "./Contexts/EditorContext";
function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const lastTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    console.log("App mounted");

    // supabase.auth.getSession().then(({ data: { session } }) => {
    //   setSession(session ?? null);
    //   if (session) upsertProfile(session.user);
    // });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentToken = session?.access_token;

      if (lastTokenRef.current !== currentToken) {
        console.log("Session updated:", session);
        lastTokenRef.current = currentToken;
        setSession(session ?? null);
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
    if (session === undefined) {
      return <div></div>; 
    }
    return session ? children : <Navigate to="/login" />;
  }

  return (
    <ThemeProvider>
      <ProfileProvider>
        <CodespaceProvider session={session ?? null}>
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
              <Route
                path="/codeeditor/:codespaceId"
                element={
                  <EditorCollaborationProvider AuthSession={session ?? null}>
                    <CodeEditorPage />
                  </EditorCollaborationProvider>
                }
              />

              <Route
                path="/codespace/sharebyemail/:invitationId"
                element={<CodespaceInvitation />}
              />
              <Route path="/" element={<Homepage />} />
            </Routes>
          </Router>
        </CodespaceProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default App;
