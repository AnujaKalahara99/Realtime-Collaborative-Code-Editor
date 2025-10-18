import express from "express";
import { streamText, generateText } from "ai";
import { google } from "@ai-sdk/google";

const router = express.Router();

router.post("/chat", async (req, res) => {
  console.log("Received chat request");
  try {
    const { messages } = req.body;

    const apiKey =
      process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Google Generative AI API key not configured" });
    }

    const isDevelopment = process.env.NODE_ENV === "development";

    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role || "user", // default to user if not provided
        parts: [{ text: msg.content || "" }],
      }));

      const result = await streamText({
        model: google("gemini-2.5-flash", {
          apiKey: apiKey,
        }),
        messages,
        system: `
          You are an expert AI coding assistant integrated into a collaborative code editor.
          Remind them you are a coding assistant when they ask about something not related to coding and programming.
          When they say hi, respond with a friendly greeting and ask how you can assist them with their coding related problems today.
          Always provide clear, concise, and accurate code solutions, explanations, and suggestions.
          Prioritize best practices, security, and performance.
          When asked for code, return only the relevant code blocks.
          If the user asks for help, debugging, or code review, give step-by-step, actionable advice.
          Never generate harmful, illegal, or unethical content.
          If the user asks for your name, respond with "RTC Copilot".
          If a request is unrelated to software engineering, politely refuse.
          Always be professional, helpful, and precise.
        `,
      });

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of result.textStream) {
        res.write(chunk);
      }

      res.end();
    } catch (aiError) {
      // If quota exceeded and in development, provide a mock response
      if (
        isDevelopment &&
        (aiError.statusCode === 429 || aiError.message?.includes("quota"))
      ) {
        console.warn("⚠️  Quota exceeded, using mock response for development");

        const mockResponse = `Hello! I'm your AI coding assistant.

I'd love to help you with your coding questions, but I'm currently experiencing quota limitations on the Gemini API.

**For now, here are some general tips:**
- Write clean, readable code
- Use proper error handling
- Follow best practices for your language
- Test your code thoroughly

Please try again in a few minutes, or consider switching to the gemini-1.5-flash model for better quota limits.`;

        res.setHeader("Content-Type", "text/plain");
        res.write(mockResponse);
        res.end();
        return;
      }

      throw aiError; // Re-throw if not a quota error or not in development
    }
  } catch (error) {
    console.error("Error in chat API route:", error);

    // Handle quota exceeded errors specifically
    if (error.message && error.message.includes("quota")) {
      return res.status(429).json({
        error:
          "AI service temporarily unavailable due to quota limits. Please try again later.",
        retryAfter: 60, // seconds
      });
    }

    // Handle other API errors
    if (error.statusCode === 429) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a moment and try again.",
        retryAfter: 30,
      });
    }

    res.status(500).json({ error: "AI service temporarily unavailable" });
  }
});

// Inline code completion endpoint
router.post("/suggest", async (req, res) => {
  try {
    const {
      prefix: rawPrefix,
      language,
      max_tokens = 24,
      temperature = 0.2,
    } = req.body || {};

    if (
      !rawPrefix ||
      typeof rawPrefix !== "string" ||
      rawPrefix.trim().length < 3
    ) {
      console.log("Prefix too short, returning empty suggestion");
      return res.json({ suggestion: "" });
    }

    // Trim prefix server-side as a safety net to keep payload small
    const maxChars = 3000;
    const maxLines = 160;
    const lines = rawPrefix.split(/\r?\n/);
    const sliced = lines.slice(Math.max(0, lines.length - maxLines));
    let prefix = sliced.join("\n");
    if (prefix.length > maxChars) {
      prefix = prefix.slice(prefix.length - maxChars);
    }

    const provider = (
      process.env.NVIDIA_STARCODER_MODEL || "gemini"
    ).toLowerCase();

    const lastLine = prefix.split(/\r?\n/).pop() || "";

    let prompt = prefix;

    if (provider !== "gemini" && lastLine.trim().length < 60) {
      prompt = prefix;
    } else if (provider === "gemini") {
      // Gemini-specific prompt with clear instructions
      prompt = `Complete this code snippet with a short, focused continuation. Only provide the next logical part of the code, without additional explanations, comments, or console.log statements:

${prefix}`;
    }

    const nvConfig =
      provider !== "gemini"
        ? {
            // Starcoder specific settings
            stop: ["\n\n", "*/", "*/\n"], // Stop at double newlines or comment ends
            suffix: "", // No suffix needed
          }
        : {};

    const maxNew = Math.max(1, Math.min(256, Number(max_tokens) || 32));
    const temp = Math.max(0, Math.min(1, Number(temperature) || 0.2));

    // Apply an overall timeout so the request fails fast and UI can recover
    const overallTimeoutMs = 2000;
    const overallController = new AbortController();
    const overallTimer = setTimeout(
      () => overallController.abort(),
      overallTimeoutMs
    );

    if (provider !== "gemini") {
      const nvKey = process.env.NVIDIA_API_KEY;
      const baseUrl =
        process.env.NVIDIA_STARCODER_URL ||
        "https://integrate.api.nvidia.com/v1";
      const model =
        process.env.NVIDIA_STARCODER_MODEL || "bigcode/starcoder2-7b";

      if (!nvKey) {
        return res.status(500).json({ error: "NVIDIA API key not configured" });
      }

      try {
        const controller = overallController; // reuse overall timeout

        const nvRes = await fetch(`${baseUrl.replace(/\/$/, "")}/completions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${nvKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            prompt,
            max_tokens: maxNew,
            temperature: temp,
            stream: false,
            // Add the stop sequences from nvConfig
            stop: nvConfig.stop,
          }),
          signal: controller.signal,
        });
        clearTimeout(overallTimer);

        if (!nvRes.ok) {
          const err = await nvRes.text();
          if (nvRes.status === 503 || nvRes.status === 429) {
            return res.status(200).json({ suggestion: "" });
          }
          return res
            .status(500)
            .json({ error: err || "NVIDIA request failed" });
        }

        const data = await nvRes.json();
        const generated =
          (data && Array.isArray(data.choices) && data.choices[0]?.text) || "";

        let suggestion = String(generated || "").trim();

        const firstSemicolon = suggestion.indexOf(";");
        const firstNewline = suggestion.indexOf("\n");
        if (firstSemicolon > 0) {
          suggestion = suggestion.substring(0, firstSemicolon + 1);
        } else if (firstNewline > 0) {
          suggestion = suggestion.substring(0, firstNewline);
        }

        // Remove any comments
        suggestion = suggestion.replace(/\/\/.*$/gm, "");
        suggestion = suggestion.replace(/\/\*[\s\S]*?\*\//g, "");

        return res.json({ suggestion });
      } catch (e) {
        clearTimeout(overallTimer);
        return res.json({ suggestion: "" });
      }
    } else {
      // Default Gemini path (existing behavior)
      const apiKey =
        process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res
          .status(500)
          .json({ error: "Google Generative AI API key not configured" });
      }

      const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

      try {
        const { text } = await Promise.race([
          generateText({
            model: google(modelName, { apiKey }),
            prompt,
            temperature: temp,
            maxTokens: maxNew,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("timeout")), overallTimeoutMs)
          ),
        ]);

        clearTimeout(overallTimer);

        // Enhanced post-processing
        let suggestion = (text || "").trim();
        suggestion = suggestion.replace(/```[\w]*\n?|```/g, "");
        suggestion = suggestion.replace(/^\s*=\s*/, "");

        return res.json({ suggestion });
      } catch (e) {
        clearTimeout(overallTimer);
        return res.json({ suggestion: "" });
      }
    }
  } catch (error) {
    console.error("/api/suggest error:", error);
    return res.status(500).json({ suggestion: "" });
  }
});

export default router;
