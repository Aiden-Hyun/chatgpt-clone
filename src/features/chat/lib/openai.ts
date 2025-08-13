import { appConfig } from '@/shared/lib/config';
import { fetchJson } from './fetch';

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
  const url = `${appConfig.edgeFunctionBaseUrl}/${functionName}`;
  return fetchJson<T>(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
}
