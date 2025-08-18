// Test-specific configuration that uses process.env instead of Deno.env
// This allows us to use real API keys in tests while running in Node.js

// Helper function to ensure secrets are present and throw a clear error if not
function getRequiredSecret(key: string): string {
  const secret = process.env[key];
  if (!secret) {
    console.error(`❌ FAILED to load secret: ${key}`);
    throw new Error(`Missing required environment secret: ${key}`);
  }
  if (process.env.DEBUG_LOGS === "true") {
    console.log(`✅ Successfully loaded secret: ${key}`);
  }
  return secret;
}

// Helper function for optional secrets
function getOptionalSecret(key: string): string | undefined {
  return process.env[key];
}

// Test configuration that mirrors the Supabase functions config
export const testConfig = {
  secrets: {
    supabase: {
      url: () => getRequiredSecret("SUPABASE_URL"),
      anonKey: () => getRequiredSecret("SUPABASE_ANON_KEY"),
      serviceRoleKey: () => getRequiredSecret("SUPABASE_SERVICE_ROLE_KEY"),
    },
    openai: {
      apiKey: () => getRequiredSecret("OPENAI_API_KEY"),
    },
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
