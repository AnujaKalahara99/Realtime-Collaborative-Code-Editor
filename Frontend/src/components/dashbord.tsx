// // src/pages/Dashboard.tsx
// import React, { useEffect, useState } from 'react';
// import { supabase } from '../superbase'; // Ensure correct import path
// import { useNavigate } from 'react-router-dom';
// import { type User } from '@supabase/supabase-js'; // Import Supabase User type

// const Dashboard = () => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Listen for auth state changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange((_event, session) => {
//       if (!session?.user) {
//         console.log('No session or user found, redirecting to login...');
//       } else {
//         setUser(session.user);
//         console.log('User logged in:', session.user);
//       }
//       setLoading(false); // Stop loading once we have a result
//     });

//     // Cleanup subscription on unmount
//     return () => {
//       subscription.unsubscribe();
//     };
//   }, [navigate]);

//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   if (error) {
//     return <p>Error: {error}</p>;
//   }

//   if (!user) {
//     return null; // Navigation will handle redirect
//   }

//   // Safely access user_metadata with fallbacks
//   const fullName = user.user_metadata?.full_name || user.email || 'User';
//   const avatarUrl = user.user_metadata?.avatar_url || ''; // Fallback to empty string

//   return (
//     <div>
//       <h2>Dashboard</h2>
//       <p>Welcome, {fullName}</p>
//       {avatarUrl && (
//         <img
//           src={avatarUrl}
//           alt="avatar"
//           style={{ borderRadius: '50%', width: 60, height: 60 }}
//           onError={(e) => {
//             e.currentTarget.style.display = 'none'; // Hide broken image
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default React.memo(Dashboard); // Optional: Memoize to prevent unnecessary re-renders


// import { useEffect, useState } from "react";
// import { supabase } from "../superbase";
// import {type  Session } from "@supabase/supabase-js";

// function Dashboard() {
//   const [session, setSession] = useState<Session | null>(null);

//   useEffect(() => {
//     supabase.auth.getSession().then(({ data: { session } }) => {
//       setSession(session);
//     });
//   }, []);
//   console.log("Session:", session);

//   if (!session) {
//     return <p>Loading...</p>;
//   }

//   const { user } = session;
//   const name = user.user_metadata.full_name || user.email;
//   const avatar = user.user_metadata.avatar_url;
//   console.log("User:", name, avatar);
//   return (
//     <div style={{ textAlign: "center", marginTop: "2rem" }}>
//       <h1>Welcome, {name}</h1>
//       {avatar && <img src={avatar} alt="Profile" style={{ borderRadius: "50%", width: 100, height: 100 }} />}
//       <p>Email: {user.email}</p>
//     </div>
//   );
// }

// export default Dashboard;


import { useNavigate } from "react-router-dom";
import { type Session } from "@supabase/supabase-js";
import { supabase } from "../superbase";
import Codeeditor from "../Codeeditor";

type Props = {
  session: Session;
};

function Dashboard({ session }: Props) {
  const navigate = useNavigate();
  const user = session.user;
  const name = user.user_metadata.full_name || user.email;
  const avatar = user.user_metadata.avatar_url;
console.log(session);
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };
  const Codeeditor = async () => {
    await supabase.auth.signOut();
    navigate("/codeeditor");
  };
  return (
    <div>
      <h2>Welcome, {name}</h2>
      {avatar && <img src={avatar} alt="profile" style={{ width: 80, borderRadius: "50%" }} />}
      <p>{user.email}</p>
      <button onClick={signOut}>Sign Out</button>
      <button onClick={Codeeditor}>Code editor</button>
    </div>
  );
}

export default Dashboard;