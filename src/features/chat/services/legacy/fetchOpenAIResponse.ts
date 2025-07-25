// src/features/chat/services/legacy/fetchOpenAIResponse.ts
// Original implementation - moved to legacy folder

/**
 * Call the Supabase edge function that proxies OpenAI chat completion.
 * @param payload Request body containing `roomId`, `messages`, `model`, etc.
 * @param accessToken Supabase session `access_token` for authorization header.
 * @returns Parsed JSON returned by the edge function / OpenAI.
 */
export async function fetchOpenAIResponse(payload: object, accessToken: string): Promise<any> {
  const res = await fetch('https://twzumsgzuwguketxbdet.functions.supabase.co/openai-chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Log and re-throw so callers can handle downstream
    console.error('Failed to parse OpenAI response:', text);
    throw err;
  }
} 