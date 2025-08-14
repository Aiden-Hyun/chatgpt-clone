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
    anthropic: {
      apiKey: () => getRequiredSecret("ANTHROPIC_API_KEY"),
    },
  },
};
