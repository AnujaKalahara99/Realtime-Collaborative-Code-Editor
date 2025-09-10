import { AIChatResponse } from "../services/aiService";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

jest.mock("ai", () => ({
  streamText: jest.fn(),
  convertToModelMessages: jest.fn(),
}));

jest.mock("@ai-sdk/google", () => ({
  google: jest.fn(),
}));

describe("AIChatResponse", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.GEMINI_API_KEY = "fake-key"; 
  });

  it("should throw error if GEMINI_API_KEY is not set", async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(AIChatResponse([{ role: "user", content: "Hello" }]))
      .rejects.toThrow("GEMINI_API_KEY environment variable is not set.");
  });

  it("should call streamText with correct parameters", async () => {
    const mockMessages = [{ role: "user", content: "Hello" }];
    const convertedMessages = [{ role: "user", content: "Hello (converted)" }];

    convertToModelMessages.mockReturnValue(convertedMessages);
    google.mockReturnValue("gemini-model");
    streamText.mockResolvedValue("mock-stream-response");

    const result = await AIChatResponse(mockMessages);

    expect(convertToModelMessages).toHaveBeenCalledWith(mockMessages);
    expect(google).toHaveBeenCalledWith("gemini-1.5-pro");
    expect(streamText).toHaveBeenCalledWith({
      model: "gemini-model",
      messages: convertedMessages,
      system: expect.stringContaining("You are an expert AI coding assistant"),
    });
    expect(result).toBe("mock-stream-response");
  });

  it("should propagate error from streamText", async () => {
    convertToModelMessages.mockReturnValue([]);
    google.mockReturnValue("gemini-model");
    streamText.mockRejectedValue(new Error("API failed"));

    await expect(AIChatResponse([{ role: "user", content: "test" }]))
      .rejects.toThrow("API failed");
  });
});
