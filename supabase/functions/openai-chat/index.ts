import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const ALLOWED_ORIGIN = Deno.env.get("ALLOWED_ORIGIN") || "*";

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
    console.log('📩 incoming model:', rawModel, '➡️ using model:', model);
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }

  console.log("📩 Received model:", model);

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return new Response("Missing OpenAI API key", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }

  // Initialize Supabase client for JWT verification
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  
  if (!supabaseUrl || !supabaseAnonKey) {
    return new Response("Missing Supabase configuration", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }

  // Create client for JWT verification
  const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
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
    console.log("Auth error:", authError);
    return new Response(JSON.stringify({ error: "Invalid JWT" }), {
      status: 401,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  }

  const userId = user.id;
  console.log("Authenticated user:", userId);

  // Create service role client for database operations
  let serviceClient = null;
  if (serviceKey) {
    serviceClient = createClient(supabaseUrl, serviceKey);
  }

  let data;
  try {
    console.log('📤 Sending to OpenAI with model:', model);
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
    console.log('📥 OpenAI response model:', data?.model || 'unknown');
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return new Response(JSON.stringify({ error: data }), {
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
  if (serviceClient && userId && roomId && !skipPersistence && data.choices?.[0]?.message) {
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
    } catch (dbError) {
      console.log("Database insert error:", dbError);
    }
  }

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
});
