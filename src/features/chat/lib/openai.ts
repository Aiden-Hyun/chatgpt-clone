/**
 * Call the Supabase edge function that proxies OpenAI chat completion.
 * @param payload Request body containing `roomId`, `messages`, `model`, etc.
 * @param accessToken Supabase session `access_token` for authorization header.
 * @returns Parsed JSON returned by the edge function / OpenAI.
 */
export async function fetchOpenAIResponse(payload: object, accessToken: string): Promise<any> {
  return callEdgeFunction('openai-chat', payload, accessToken);
}

/**
 * Call a Supabase Edge Function with authorization
 * @param functionName Name of the edge function to call
 * @param payload Request body to send
 * @param accessToken Supabase session access_token for authorization
 * @returns Parsed JSON response from the edge function
 */
async function callEdgeFunction<T = any>(
  functionName: string,
  payload: object,
  accessToken: string
): Promise<T> {
  return fetchJson<T>(`${EDGE_FUNCTION_BASE_URL}/${functionName}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}

// Constants
const EDGE_FUNCTION_BASE_URL = 'https://twzumsgzuwguketxbdet.functions.supabase.co';

/**
 * Fetch JSON from a URL with proper error handling
 */
async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error('Failed to parse JSON response:', text);
    throw err;
  }
}
