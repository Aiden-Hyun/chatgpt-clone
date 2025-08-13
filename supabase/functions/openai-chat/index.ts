/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "../shared/config.ts";

serve(async (req) => {
  const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";
  const DEBUG = Deno.env.get("DEBUG_LOGS") === "true";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  let messages;
  let roomId;
  let model;
  let clientMessageId: string | null = null;
  let skipPersistence = false;

  try {
    const body = await req.text();
    const parsed = JSON.parse(body);
    messages = parsed.messages;
    roomId = parsed.roomId;
    const rawModel = parsed.model;
    model = typeof rawModel === 'string' && rawModel.trim().length > 0 ? rawModel.trim() : 'gpt-3.5-turbo';
    clientMessageId = typeof parsed.clientMessageId === 'string' && parsed.clientMessageId.trim() ? parsed.clientMessageId : null;
    skipPersistence = !!parsed.skipPersistence;
    if (DEBUG) console.log('📩 incoming model:', rawModel, '➡️ using model:', model);
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }
  if (DEBUG) console.log("📩 Received model:", model);

  // Use the new centralized config
  const SUPABASE_URL = config.secrets.supabase.url();
  const SUPABASE_ANON_KEY = config.secrets.supabase.anonKey();
  const SUPABASE_SERVICE_ROLE_KEY = config.secrets.supabase.serviceRoleKey();
  const OPENAI_API_KEY = config.secrets.openai.apiKey();

  // Create client for JWT verification
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: req.headers.get("authorization") ?? "" } }
  });

  // Verify JWT and get user
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization header" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  }

  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    if (DEBUG) console.log("Auth error");
    return new Response(JSON.stringify({ error: "Invalid JWT" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  }

  const userId = user.id;
  if (DEBUG) console.log("Authenticated user:", userId);

  // Create service role client for database operations
  const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  let data;
  try {
    if (DEBUG) console.log('📤 Sending to OpenAI with model:', model);
    // Prepend system message indicating the model being used
    const systemMessage = {
      role: 'system',
      content: `You are a helpful assistant powered by the ${model} model.`,
    };
    const messagesForOpenAI = [systemMessage, ...messages];
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: messagesForOpenAI,
      }),
    });

    data = await response.json();
    if (DEBUG) console.log('📥 OpenAI response model:', data?.model || 'unknown');
    if (!response.ok) {
      console.error("OpenAI API error", { status: response.status, error: data?.error?.message });
      return new Response(JSON.stringify({ error: data?.error || 'OpenAI error' }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });
    }
  } catch (err) {
    console.error("Request or JSON parse error:", err);
    return new Response(JSON.stringify({ error: "Failed to reach OpenAI" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  }

  // Store messages if everything succeeded and not explicitly skipped (regen)
  if (userId && roomId && !skipPersistence && data.choices?.[0]?.message) {
    const userMessage = messages[messages.length - 1];
    const assistantMessage = data.choices[0].message;

    try {
      await serviceClient
        .from("messages")
        .upsert([
          {
            room_id: roomId,
            user_id: userId,
            role: userMessage.role,
            content: userMessage.content,
            client_id: clientMessageId,
          },
          {
            room_id: roomId,
            user_id: userId,
            role: assistantMessage.role,
            content: assistantMessage.content,
            client_id: clientMessageId,
          },
        ], { onConflict: 'room_id,role,client_id' });
    } catch (_dbError) {
      if (DEBUG) console.log("Database insert error");
    }
  }

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
});
