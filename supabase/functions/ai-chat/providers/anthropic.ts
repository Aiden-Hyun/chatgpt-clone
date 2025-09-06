// supabase/functions/ai-chat/providers/anthropic.ts
import { config } from "../../shared/config.ts";

export async function callAnthropic(
  model: string,
  messages: any[],
  modelConfig?: any
) {
  console.log("[ANTHROPIC] Starting callAnthropic with model:", model);
  console.log(
    "[ANTHROPIC] ModelConfig received:",
    JSON.stringify(modelConfig, null, 2)
  );

  const ANTHROPIC_API_KEY = config.secrets.anthropic.apiKey();
  console.log(
    "ANTHROPIC_API_KEY retrieved:",
    ANTHROPIC_API_KEY ? `...${ANTHROPIC_API_KEY.slice(-4)}` : "Not found"
  );

  // Extract system message if present, or use default
  const systemMessages = messages.filter((m) => m.role === "system");
  const systemPrompt =
    systemMessages.length > 0
      ? systemMessages[0].content
      : "You are a helpful assistant.";

  // Anthropic's API does not accept an 'id' field in the message objects or system messages.
  // We need to filter out system messages and map over the rest to remove any extra fields.
  const userMessages = messages
    .filter((m) => m.role !== "system")
    .map(({ role, content }) => ({ role, content }));

  // Use the passed modelConfig instead of trying to determine it
  const tokenParameter = modelConfig?.tokenParameter || "max_tokens";
  const tempConfig =
    modelConfig?.supportsCustomTemperature !== false
      ? { temperature: modelConfig?.defaultTemperature || 0.7 }
      : {};

  const requestBody = {
    model: model,
    [tokenParameter]: modelConfig?.max_tokens || 1024, // FIX: Use modelConfig.max_tokens
    system: systemPrompt,
    messages: userMessages,
    ...tempConfig, // Only include temperature if the model supports it
  };

  console.log(
    "[ANTHROPIC] Final request body:",
    JSON.stringify(requestBody, null, 2)
  );
  console.log("[ANTHROPIC] About to make API call to Anthropic...");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01", // This is a stable API version that works with all Claude models
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log("[ANTHROPIC] Response Status:", response.status);
  console.log("[ANTHROPIC] Response Body:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error("[ANTHROPIC] API error details:", {
      status: response.status,
      error: data?.error,
    });
    console.error(
      "[ANTHROPIC] Full error response:",
      JSON.stringify(data, null, 2)
    );
    throw new Error(
      data?.error?.message || data?.error?.type || "Anthropic API error"
    );
  }

  // Standardize the response to look like OpenAI's
  return {
    choices: [
      {
        message: {
          role: "assistant",
          content: data.content[0].text,
        },
      },
    ],
  };
}
