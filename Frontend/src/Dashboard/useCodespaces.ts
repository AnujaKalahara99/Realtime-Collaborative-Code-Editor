
// import { useState, useEffect } from "react";
// import { type Session } from "@supabase/supabase-js";
// import { type Codespace } from "./codespace.types";

// export const useCodespaces = (session: Session) => {
//   const [codespaces, setCodespaces] = useState<Codespace[]>([]);
//   const user = session.user;
//   const name = user.user_metadata.full_name || user.email;

//   const getToken = () => {
//     const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
//     const sessionDataString = localStorage.getItem(storageKey);
//     const sessionData = JSON.parse(sessionDataString || "null");
//     console.log("getToken sessionData:", sessionData);
//     return sessionData?.access_token || "";
//   };

//   useEffect(() => {
//     const fetchCodespaces = async () => {
//       try {
//         const token = getToken();
//         if (!token) {
//           console.error("No token available for fetchCodespaces");
//           return;
//         }
//         console.log(getToken());
//         const response = await fetch("http://localhost:4000/codespaces", {
//           method: "GET",
//           headers: {
//             Authorization: getToken(), // Ensure Bearer prefix
//           },
//         });
//         const data = await response.json();

//         if (data.codespaces) {
//           const codespaceList: Codespace[] = data.codespaces.map(
//             (item: Codespace) => ({
//               id: item.id,
//               name: item.name,
//               role:item.role,
//               lastModified:item.lastModified,
//               owner: name,
//             })
//           );
//           setCodespaces(codespaceList);
//         }
//       } catch (error) {
//         console.error("Unexpected error in fetchCodespaces:", error);
//       }
//     };

//     fetchCodespaces();
//   }, [name]);

//   const createCodespace = async (workspaceName: string): Promise<boolean> => {
//     if (!workspaceName.trim()) return false;

//     try {
//       const token = getToken();
     
//       if (!token) {
//         console.error("No token available for createCodespace");
//         return false;
//       }

//       const response = await fetch("http://localhost:4000/codespaces", {
//         method: "POST",
//         headers: {
//           Authorization:  getToken(),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name: workspaceName,
//         }),
//       });
//       const data = await response.json();

//       if (data.codespace) {
//         const newWorkspace: Codespace = {
//           id: data.codespace.id,
//           name: data.codespace.name,
//           lastModified: data.codespace.lastModified,
//           created_at: data.codespace.created_at,
//           owner: name,
//         };
//         setCodespaces([newWorkspace, ...codespaces]);
//         return true;
//       }
//     } catch (error) {
//       console.error("Unexpected error in createCodespace:", error);
//     }
//     return false;
//   };

//   const deleteCodespace = async (id: string): Promise<boolean> => {
//     try {
//       const token = getToken();
//       if (!token) {
//         console.error("No token available for deleteCodespace");
//         return false;
//       }

//       const response = await fetch(`http://localhost:4000/codespaces/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization:  getToken(),
//           "Content-Type": "application/json",
//         },
//       });

//       if (response.ok) {
//         setCodespaces((prev) => prev.filter((c) => c.id !== id));
//         return true;
//       }
//     } catch (error) {
//       console.error("Error deleting codespace:", error);
//     }
//     return false;
//   };
 

//   const shareCodespace = async (id: string, email: string): Promise<boolean> => {
//     try {
//       const token = getToken();
//       if (!token) {
//         console.error("No token available for shareCodespace");
//         return false;
//       }

//       if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
//         console.error("Invalid email: Email cannot be empty or invalid");
//         return false;
//       }

//       console.log("Share request details:", {
//         url: `http://localhost:4000/codespaces/${id}/share`,
//         method: "POST",
//         token,
//         email,
//         body: JSON.stringify({ email: email.trim() }),
//       });

//       const response = await fetch(`http://localhost:4000/codespaces/${id}/share`, {
//         method: "POST",
//         headers: {
//           Authorization: getToken(),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ email: email.trim() }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error("Server error:", response.status, errorData);
//         return false;
//       }

//       // Do NOT update codespaces state to prevent auto-reload
//       return true;
//     } catch (error) {
//       console.error("Error sharing codespace:", error);
//       return false;
//     }
//   };

//   const editCodespace = async (id: string, newName: string): Promise<boolean> => {
//     try {
//       const token = getToken();
//       if (!token) {
//         console.error("No token available for editCodespace");
//         return false;
//       }
//        console.log("token", token);
//       console.log("Request details:", {
//         url: `http://localhost:4000/codespaces/${id}`,
//         method: "PUT",
//         token,
//         newName,
//         body: JSON.stringify({ name: newName }),
//       });

//       if (!newName || newName.trim() === "") {
//         console.error("Invalid name: Codespace name cannot be empty or undefined");
//         return false;
//       }

//       const response = await fetch(`http://localhost:4000/codespaces/${id}`, {
//         method: "PUT",
//         headers: {
//           Authorization: getToken(),
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ name: newName.trim() }),
//       });

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         console.error("Server error:", response.status, errorData);
//         return false;
//       }

//       // Do NOT update codespaces state to prevent auto-reload
//       return true;
//     } catch (error) {
//       console.error("Error editing codespace:", error);
//       return false;
//     }
//   };

//   return { codespaces, createCodespace, deleteCodespace, shareCodespace, editCodespace };
// };


import { useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import { type Codespace } from "./codespace.types";

export const useCodespaces = (session: Session) => {
  const [codespaces, setCodespaces] = useState<Codespace[]>([]);
  const user = session.user;
  const name = user.user_metadata.full_name || user.email;

  const getToken = () => {
    const storageKey = `sb-${import.meta.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    const sessionDataString = localStorage.getItem(storageKey);
    const sessionData = JSON.parse(sessionDataString || "null");
    console.log("getToken sessionData:", sessionData);
    return sessionData?.access_token || "";
  };

  useEffect(() => {
    const fetchCodespaces = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token available for fetchCodespaces");
          return;
        }
        console.log(getToken());
        const response = await fetch("http://localhost:4000/codespaces", {
          method: "GET",
          headers: {
            Authorization: getToken(), // Ensure Bearer prefix
          },
        });
        const data = await response.json();

        if (data.codespaces) {
          const codespaceList: Codespace[] = data.codespaces.map(
            (item: Codespace) => ({
              id: item.id,
              name: item.name,
              role:item.role,
              lastModified:item.lastModified,
              owner: name,
            })
          );
          setCodespaces(codespaceList);
        }
      } catch (error) {
        console.error("Unexpected error in fetchCodespaces:", error);
      }
    };

    fetchCodespaces();
  }, [name]);

  const createCodespace = async (workspaceName: string): Promise<boolean> => {
    if (!workspaceName.trim()) return false;

    try {
      const token = getToken();
     
      if (!token) {
        console.error("No token available for createCodespace");
        return false;
      }

      const response = await fetch("http://localhost:4000/codespaces", {
        method: "POST",
        headers: {
          Authorization:  getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: workspaceName,
        }),
      });
      const data = await response.json();

      if (data.codespace) {
        const newWorkspace: Codespace = {
          id: data.codespace.id,
          name: data.codespace.name,
          lastModified: data.codespace.lastModified,
          created_at: data.codespace.created_at,
          owner: name,
        };
        setCodespaces([newWorkspace, ...codespaces]);
        return true;
      }
    } catch (error) {
      console.error("Unexpected error in createCodespace:", error);
    }
    return false;
  };

  const deleteCodespace = async (id: string): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token available for deleteCodespace");
        return false;
      }

      const response = await fetch(`http://localhost:4000/codespaces/${id}`, {
        method: "DELETE",
        headers: {
          Authorization:  getToken(),
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setCodespaces((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
    } catch (error) {
      console.error("Error deleting codespace:", error);
    }
    return false;
  };
 

  const shareCodespacebyemail = async (id: string, email: string, role:string): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token available for shareCodespace");
        return false;
      }

      if (!email || !email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        console.error("Invalid email: Email cannot be empty or invalid");
        return false;
      }

      console.log("Share request details:", {
        url: `http://localhost:4000/codespaces/${id}/sharebyemail`,
        method: "POST",
        token,
        email,
        body: JSON.stringify({ email: email.trim(), role: role.trim() }),
      });

      const response = await fetch(`http://localhost:4000/codespaces/${id}/sharebyemail`, {
        method: "POST",
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), role: role.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", response.status, errorData);
        return false;
      }

      // Do NOT update codespaces state to prevent auto-reload
      return true;
    } catch (error) {
      console.error("Error sharing codespace:", error);
      return false;
    }
  };

  const editCodespace = async (id: string, newName: string): Promise<boolean> => {
    try {
      const token = getToken();
      if (!token) {
        console.error("No token available for editCodespace");
        return false;
      }
       console.log("token", token);
      console.log("Request details:", {
        url: `http://localhost:4000/codespaces/${id}`,
        method: "PUT",
        token,
        newName,
        body: JSON.stringify({ name: newName }),
      });

      if (!newName || newName.trim() === "") {
        console.error("Invalid name: Codespace name cannot be empty or undefined");
        return false;
      }

      const response = await fetch(`http://localhost:4000/codespaces/${id}`, {
        method: "PUT",
        headers: {
          Authorization: getToken(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Server error:", response.status, errorData);
        return false;
      }

      // Do NOT update codespaces state to prevent auto-reload
      return true;
    } catch (error) {
      console.error("Error editing codespace:", error);
      return false;
    }
  };

  return { codespaces, createCodespace, deleteCodespace, shareCodespacebyemail, editCodespace };
};