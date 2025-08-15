/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "../shared/config.ts";
import { callAnthropic } from "./providers/anthropic.ts";
import { callOpenAI } from "./providers/openai.ts";
import { callOpenAIImage } from "./providers/openai-image.ts";

serve(async (req) => {
  const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
  const DEBUG = Deno.env.get("DEBUG_LOGS") === "true";

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const body = await req.json();
    const { model, messages, roomId, clientMessageId, skipPersistence } = body;

    // --- Authentication ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    
    const supabaseClient = createClient(config.secrets.supabase.url(), config.secrets.supabase.anonKey(), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Invalid JWT");

    console.log(`[ROUTER] Received model: ${model}`);

    // --- API Routing ---
    let responseData;
    if (model === 'gpt-image-1' || model.startsWith('gpt-image')) {
      console.log('[ROUTER] Routing to OpenAI Images...');
      const prompt = messages?.slice().reverse().find((m: any) => m.role === 'user')?.content ?? '';
      responseData = await callOpenAIImage(prompt);
    } else if (model.startsWith('gpt-')) {
      console.log('[ROUTER] Routing to OpenAI...');
      responseData = await callOpenAI(model, messages);
    } else if (model.startsWith('claude-')) {
      console.log('[ROUTER] Routing to Anthropic...');
      responseData = await callAnthropic(model, messages);
    } else {
      console.error(`[ROUTER] Unsupported model: ${model}`);
      throw new Error(`Unsupported model: ${model}`);
    }

    console.log('[ROUTER] API call successful, processing response...');

    // --- Database Operations ---
    if (user.id && roomId && !skipPersistence && responseData.choices?.[0]?.message) {
        const serviceClient = createClient(config.secrets.supabase.url(), config.secrets.supabase.serviceRoleKey());
        const userMessage = messages[messages.length - 1];
        const assistantMessage = responseData.choices[0].message;

        await serviceClient.from("messages").upsert([
            { room_id: roomId, user_id: user.id, role: userMessage.role, content: userMessage.content, client_id: clientMessageId },
            { room_id: roomId, user_id: user.id, role: assistantMessage.role, content: assistantMessage.content, client_id: clientMessageId },
        ], { onConflict: 'room_id,role,client_id' });
    }

    return new Response(JSON.stringify(responseData), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });

  } catch (error) {
    console.error("Error processing request:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }
});
