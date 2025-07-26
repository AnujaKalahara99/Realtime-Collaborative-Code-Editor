import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./superbase";
import { type Session } from "@supabase/supabase-js";
import Dashboard from "./components/Dashbord";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Codeeditor from "./Codeeditor";

function App() {
  const [session, setSession] = useState<Session | null>(null);

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

  async function upsertProfile(user: any) {
    const { id, user_metadata, email } = user;
    const full_name = user_metadata.full_name || "";
    const avatar_url = user_metadata.avatar_url || "";

    const { error } = await supabase
      .from("profiles")
      .upsert({
        id,
        full_name,
        email,
        avatar_url,
      }, { onConflict: "id" });

    if (error) console.error("Error upserting profile:", error.message);
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={<Dashboard   type="user" session={session} />}
      />
      <Route
        path="/"
        element={<Login />}
      />
      <Route path="/codeeditor" element={<Codeeditor />} />
    </Routes>
  );
}

export default App;