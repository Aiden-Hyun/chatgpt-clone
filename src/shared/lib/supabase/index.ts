// src/lib/supabase/index.ts
import { createClient } from "@supabase/supabase-js";

import { getLogger } from "../../services/logger";
import { appConfig } from "../config";

const runtimeLogger = getLogger("SupabaseFetch");

// One-time runtime diagnostics
try {
  const isRN =
    typeof navigator !== "undefined" &&
    (navigator as any).product === "ReactNative";
  const hasXHR = typeof (global as any).XMLHttpRequest !== "undefined";
  const hasFetch = typeof (global as any).fetch === "function";
  const fetchName = hasFetch ? ((global as any).fetch as any).name : "none";
  runtimeLogger.info("Runtime fetch diagnostics", {
    isRN,
    hasXHR,
    hasFetch,
    fetchName,
  });
} catch {
  // ignore
}

// Wrap global.fetch to add request/response logging
const customFetch: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  let urlString: string | undefined;
  try {
    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    } else if (typeof (input as any)?.url === "string") {
      urlString = (input as any).url;
    }
  } catch {
    // ignore
  }

  runtimeLogger.debug("HTTP request", {
    url: urlString,
    method:
      (init?.method as string) ||
      (typeof input === "object" && (input as Request).method) ||
      "GET",
    hasHeaders: !!init?.headers,
  });

  try {
    const response = await (global as any).fetch(input as any, init as any);
    runtimeLogger.debug("HTTP response", {
      url: urlString,
      status: (response as any)?.status,
      ok: (response as any)?.ok,
    });
    return response;
  } catch (err: any) {
    runtimeLogger.error("HTTP error", {
      url: urlString,
      name: err?.name,
      message: err?.message,
    });
    throw err;
  }
};

// Create and export the Supabase client with our new secure config
export const supabase = createClient(
  appConfig.supabaseUrl,
  appConfig.supabaseAnonKey,
  {
    auth: {
      // Enable auto refresh token for React Native
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
    // Add React Native specific options
    global: {
      headers: {
        "X-Client-Info": "supabase-js-react-native",
      },
      fetch: customFetch as any,
    },
  }
);
