import express from "express";
import { streamText } from "ai";
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
      const result = await streamText({
        model: google("gemini-1.5-flash", {
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
          If the user asks for your name, respond with "GitHub Copilot".
          If a request is unrelated to software engineering, politely refuse.
          Always be professional, helpful, and precise. 
        `,
      });

      res.setHeader("Content-Type", "text/plain");
      res.setHeader("Transfer-Encoding", "chunked");

      for await (const chunk of result.textStream) {
        console.log(chunk);
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

export default router;
