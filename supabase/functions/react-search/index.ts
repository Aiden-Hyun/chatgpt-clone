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
    const { question, model } = body;

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
    const cacheManager = new CacheManager(supabaseClient);
    const searchService = new SearchService(cacheManager);
    const fetchService = new FetchService(cacheManager);
    const rerankService = new RerankService();

    // --- Create and Run ReAct Agent ---
    const agent = new ReActAgent({
      cacheManager,
      searchService,
      fetchService,
      rerankService,
      debug: DEBUG,
      model: selectedModel, // Pass the selected model to the agent
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
      message: error?.message, 
      stack: error?.stack 
    });
    
    return new Response(JSON.stringify({ 
      error: error?.message || 'Unknown error',
      trace: error?.stack 
    }), {
      status: 400,
      headers: { 
        "Content-Type": "application/json", 
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN 
      },
    });
  }
});
