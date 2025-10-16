import { getTokenFromStorage } from "../../utility/utility";

export type SuggestPayload = {
  prefix: string;
  language?: string;
  max_tokens?: number;
  temperature?: number;
};

export type SuggestResponse = {
  suggestion: string;
};

const API_AI = `${import.meta.env?.VITE_BACKEND_URL}/api/suggest`;

const getAuthHeader = () => {
  return { Authorization: getTokenFromStorage() };
};

export async function fetchSuggestion(
  payload: SuggestPayload,
  signal?: AbortSignal
): Promise<string> {
  // Apply a client-side timeout to avoid hanging UI. Defaults to 1.2s.
  const timeoutMs = 1200;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  let timeoutId: any;
  try {
    // Propagate cancellation both ways
    signal?.addEventListener("abort", onAbort, { once: true });
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(API_AI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify(payload),
      signal: signal ?? controller.signal,
    });
    if (!res.ok) return "";
    const data = (await res.json()) as SuggestResponse;
    return data.suggestion || "";
  } catch {
    return "";
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onAbort as any);
  }
}
