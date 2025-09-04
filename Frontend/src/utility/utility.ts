export const getTokenFromStorage = () => {
  const storageKey = `sb-${
    import.meta.env.VITE_SUPABASE_PROJECT_ID
  }-auth-token`;
  const sessionData = JSON.parse(localStorage.getItem(storageKey) || "null");
  return sessionData?.access_token || "";
};

export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${formattedDate}, ${formattedTime}`;
};
