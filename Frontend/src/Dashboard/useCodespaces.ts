import { useState, useEffect } from "react";
import { type Session } from "@supabase/supabase-js";
import { type Codespace } from "./codespace.types";

export const useCodespaces = (session: Session) => {
  const [codespaces, setCodespaces] = useState<Codespace[]>([]);
  const user = session.user;
  const name = user.user_metadata.full_name || user.email;

  const getToken = () => {
    const storageKey = `sb-${
      import.meta.env.VITE_SUPABASE_PROJECT_ID
    }-auth-token`;
    const sessionDataString = localStorage.getItem(storageKey);
    const sessionData = JSON.parse(sessionDataString || "null");
    return sessionData?.access_token;
  };

  useEffect(() => {
    const fetchCodespaces = async () => {
      try {
        const response = await fetch("http://localhost:4000/codespaces", {
          method: "GET",
          headers: {
            Authorization: getToken(),
          },
        });
        const data = await response.json();

        if (data.codespaces) {
          const codespaceList: Codespace[] = data.codespaces.map(
            (item: Codespace) => ({
              id: item.id,
              name: item.name,
              lastModified: new Date(item.created_at).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
              owner: name,
            })
          );
          setCodespaces(codespaceList);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      }
    };

    fetchCodespaces();
  }, [name]);

  const createCodespace = async (workspaceName: string): Promise<boolean> => {
    if (!workspaceName.trim()) return false;

    try {
      const response = await fetch("http://localhost:4000/codespaces", {
        method: "POST",
        headers: {
          Authorization: getToken(),
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
      console.error("Unexpected error:", error);
    }
    return false;
  };

  return { codespaces, createCodespace };
};
