import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "../shared/config.ts";
import { ReActAgent } from "./agent.ts";
import { CacheManager } from "./cache.ts";
import { FetchService } from "./services/fetch.ts";
import { RerankService } from "./services/rerank.ts";
import { SearchService } from "./services/search.ts";

serve(async (req) => {
  const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
  const DEBUG = Deno.env.get("DEBUG_LOGS") === "true";

  console.log(`[REACT-SEARCH] Function called at ${new Date().toISOString()}`);
  console.log(`[REACT-SEARCH] Request method: ${req.method}`);

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const body = await req.json();
    console.log(`[REACT-SEARCH] Request body keys: ${Object.keys(body)}`);
    const { question, model, modelConfig } = body;

    if (!question || typeof question !== 'string') {
      throw new Error("Missing or invalid 'question' parameter");
    }

    // Use provided model or fall back to default
    const selectedModel = model || 'gpt-4o';
    console.log(`[REACT-SEARCH] Using model: ${selectedModel}`);

    // --- Authentication ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    
    const supabaseClient = createClient(config.secrets.supabase.url(), config.secrets.supabase.anonKey(), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Invalid JWT");

    console.log(`[REACT-SEARCH] Processing question: ${question.substring(0, 100)}...`);

    // --- Initialize Services ---
    // Create a service role client specifically for cache operations that require elevated permissions
    const supabaseServiceClient = createClient(
      config.secrets.supabase.url(),
      config.secrets.supabase.serviceRoleKey()
    );
    
    // Use service role client for cache operations with improved configuration
    const cacheManager = new CacheManager(supabaseServiceClient, {
      debug: DEBUG,
      cacheEnabled: true,
      memCacheEnabled: true,
      tableName: 'agent_cache' // Use the new consolidated cache table
    });
    
    // Log cache initialization
    console.log(`[REACT-SEARCH] Cache manager initialized with debug=${DEBUG}`);
    
    const searchService = new SearchService(cacheManager);
    const fetchService = new FetchService(cacheManager);
    const rerankService = new RerankService();

    // --- Create and Run ReAct Agent ---
    // Determine model provider based on model name
    const getModelProvider = (model: string) => {
      if (model.startsWith('claude')) {
        return 'anthropic';
      }
      return 'openai';
    };
    
    const modelProvider = getModelProvider(selectedModel);
    console.log(`[REACT-SEARCH] Using model provider: ${modelProvider}`);
    
    const agent = new ReActAgent({
      cacheManager,
      searchService,
      fetchService,
      rerankService,
      debug: DEBUG,
      model: selectedModel,
      modelConfig: modelConfig || {
        tokenParameter: 'max_tokens',
        supportsCustomTemperature: true,
        defaultTemperature: modelProvider === 'anthropic' ? 0.7 : 0.1
      },
    });

    const result = await agent.run(question);

    console.log(`[REACT-SEARCH] Agent completed successfully`);
    if (DEBUG) {
      console.log(`[REACT-SEARCH] Trace:`, JSON.stringify(result.trace, null, 2));
    }

    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN 
      },
    });

  } catch (error) {
    console.error('[REACT-SEARCH] Error processing request', { 
      message: typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error),
      stack: typeof error === "object" && error !== null && "stack" in error ? (error as any).stack : undefined
    });
    
    return new Response(JSON.stringify({ 
      message: typeof error === "object" && error !== null && "message" in error ? (error as any).message : String(error),
      stack: typeof error === "object" && error !== null && "stack" in error ? (error as any).stack : undefined

    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN 
      },
    });
  }
});