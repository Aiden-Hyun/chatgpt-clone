// @ts-nocheck
// supabase/functions/shared/config.ts

// Helper function to ensure secrets are present and throw a clear error if not
function getRequiredSecret(key: string): string {
  const secret = Deno.env.get(key);
  if (!secret) {
    // This error will be visible in your Edge Function logs
    console.error(`❌ FAILED to load secret: ${key}`);
    throw new Error(`Missing required environment secret: ${key}`);
  }
  if (Deno.env.get("DEBUG_LOGS") === "true") {
    console.log(`✅ Successfully loaded secret: ${key}`);
  }
  return secret;
}

// Helper function for optional secrets
function getOptionalSecret(key: string): string | undefined {
  return Deno.env.get(key);
}

// Centralized configuration for all Edge Functions
export const config = {
  secrets: {
    supabase: {
      url: () => getRequiredSecret("SUPABASE_URL"),
      anonKey: () => getRequiredSecret("SUPABASE_ANON_KEY"),
      serviceRoleKey: () => getRequiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
    },
    openai: {
      apiKey: () => getRequiredSecret("OPENAI_API_KEY"),
    },
    // Anthropic is now used in react-search for Claude models
    anthropic: {
      apiKey: () => getRequiredSecret("ANTHROPIC_API_KEY"),
    },
    tavily: {
      apiKey: () => getOptionalSecret("TAVILY_API_KEY"),
    },
    cohere: {
      apiKey: () => getOptionalSecret("COHERE_API_KEY"),
    },
    microlink: {
      apiKey: () => getOptionalSecret("MICROLINK_API_KEY"),
    },
    bing: {
      apiKey: () => getOptionalSecret("BING_API_KEY"),
    },
    serpapi: {
      apiKey: () => getOptionalSecret("SERPAPI_API_KEY"),
    },
    jina: {
      apiKey: () => getOptionalSecret("JINA_API_KEY"),
    },
  },
};