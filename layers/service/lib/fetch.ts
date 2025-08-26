// src/features/chat/lib/fetch.ts
import { NETWORK } from './constants';
/**
 * Fetch JSON from a URL with abort + timeout and proper error handling
 * - Respects an external AbortSignal if provided
 * - Applies a timeout that aborts the request when exceeded
 * - Classifies abort vs timeout vs network errors
 */
export async function fetchJson<T>(
  url: string,
  options: RequestInit = {},
  timeoutMs = NETWORK.REQUEST_TIMEOUT_MS,
): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;

  // If caller provided a signal, link it to our controller so either can abort
  const externalSignal = options.signal;
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', () => controller.abort(), { once: true });
    }
  }

  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!res.ok) {
      const errorBody = await res.text();
      if (__DEV__) {
        console.error(`HTTP error! status: ${res.status}, body: ${errorBody}`);
      } else {
        console.error(`HTTP error! status: ${res.status}`);
      }
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const text = await res.text();
    try {
      return JSON.parse(text) as T;
    } catch {
      if (__DEV__) {
        console.error('Failed to parse JSON response:', text);
      } else {
        console.error('Failed to parse JSON response');
      }
      throw new Error('Failed to parse JSON response.');
    }
  } catch (err: any) {
    // Normalize abort/timeout errors
    const isAbort = err && (err.name === 'AbortError' || err.code === 'ABORT_ERR');
    if (isAbort || timedOut) {
      const error = new Error(timedOut ? 'Request timed out' : 'The operation was aborted');
      (error as any).name = timedOut ? 'TimeoutError' : 'AbortError';
      throw error;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
