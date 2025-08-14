// supabase/functions/ai-chat/providers/anthropic.ts
import { config } from '../../shared/config.ts';

export async function callAnthropic(model: string, messages: any[]) {
  const ANTHROPIC_API_KEY = config.secrets.anthropic.apiKey();
  console.log("ANTHROPIC_API_KEY retrieved:", ANTHROPIC_API_KEY ? `...${ANTHROPIC_API_KEY.slice(-4)}` : "Not found");

  const systemPrompt = "You are a helpful assistant.";
  
  // Anthropic's API does not accept an 'id' field in the message objects.
  // We need to map over the messages and remove the 'id' before sending.
  const userMessages = messages
    .filter(m => m.role !== 'system')
    .map(({ role, content }) => ({ role, content }));

  const requestBody = {
    model: model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: userMessages,
  };

  console.log("Anthropic Request Body:", JSON.stringify(requestBody, null, 2));

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const data = await response.json();
  console.log("Anthropic Response Status:", response.status);
  console.log("Anthropic Response Body:", JSON.stringify(data, null, 2));

  if (!response.ok) {
    console.error("Anthropic API error details:", { status: response.status, error: data?.error });
    throw new Error(data?.error?.message || data?.error?.type || 'Anthropic API error');
  }

  // Standardize the response to look like OpenAI's
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: data.content[0].text
      }
    }]
  };
}
