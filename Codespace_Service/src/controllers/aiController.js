import { streamAIChatResponse } from "../services/aiService";
import { StreamData, StreamingTextResponse } from "ai";

export async function handleChatRequest(messages) {
  try {
    const result = await streamAIChatResponse(messages);
    if (!result || typeof result.toAIStream !== "function") {
      throw new Error("Invalid AI service response");
    }
    // Optionally, you can add data to the stream, e.g., for sources or tool calls
    const data = new StreamData();
    // data.append({ someCustomData: 'value' }); // Example of appending custom data

    const stream = result.toAIStream({
      onFinal() {
        data.close();
      },
    });

    return new StreamingTextResponse(stream, {}, data);
  } catch (error) {
    console.error("Error handling chat request:", error);
    throw error;
  }
}
