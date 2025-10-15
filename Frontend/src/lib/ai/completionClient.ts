export type SuggestPayload = {
  prefix: string;
  language?: string;
  max_tokens?: number;
  temperature?: number;
};

export type SuggestResponse = {
  suggestion: string;
};

// Default to API Gateway in dev; override via VITE_COMPLETION_API_URL when deploying behind same origin
const API_BASE =
  (import.meta as any).env?.VITE_COMPLETION_API_URL ||
  "http://localhost:4000/ai";

export async function fetchSuggestion(
  payload: SuggestPayload,
  signal?: AbortSignal
): Promise<string> {
  const endpoint = `${API_BASE}/suggest`;
  // Apply a client-side timeout to avoid hanging UI. Defaults to 1.2s.
  const timeoutMs = 1200;
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  let timeoutId: any;
  try {
    // Propagate cancellation both ways
    signal?.addEventListener("abort", onAbort, { once: true });
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
