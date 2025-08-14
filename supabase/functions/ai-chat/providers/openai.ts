// supabase/functions/ai-chat/providers/openai.ts
import { config } from '../../shared/config.ts';

export async function callOpenAI(model: string, messages: any[]) {
  const OPENAI_API_KEY = config.secrets.openai.apiKey();

  const systemMessage = {
    role: 'system',
    content: `You are a helpful assistant powered by the ${model} model.`,
  };
  const messagesForOpenAI = [systemMessage, ...messages];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: messagesForOpenAI,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("OpenAI API error", { status: response.status, error: data?.error?.message });
    throw new Error(data?.error?.message || 'OpenAI API error');
  }

  // Standardize the response
  return {
    choices: [{
      message: {
        role: 'assistant',
        content: data.choices[0].message.content,
      }
    }]
  };
}
