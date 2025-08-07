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

  try {
    const body = await req.text();
    const parsed = JSON.parse(body);
    messages = parsed.messages;
    roomId = parsed.roomId;
    const rawModel = parsed.model;
    model = typeof rawModel === 'string' && rawModel.trim().length > 0 ? rawModel.trim() : 'gpt-3.5-turbo';
  } catch {
    return new Response("Invalid JSON body", {
      status: 400,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    return new Response("Missing OpenAI API key", {
      status: 500,
      headers: { "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }

  // Get user ID from JWT token
  const authHeader = req.headers.get("authorization");
  let userId = null;
  if (authHeader) {
    try {
      const token = authHeader.replace("Bearer ", "");
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub;
    } catch (e) {
      // JWT parse error
    }
  }

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let supabaseClient = null;
  if (supabaseUrl && serviceKey) {
    supabaseClient = createClient(supabaseUrl, serviceKey);
  }

  let data;
  try {
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
    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: response.status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
        },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to reach OpenAI" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      },
    });
  }

  // Store messages if everything succeeded
  if (supabaseClient && userId && roomId && data.choices?.[0]?.message) {
    const userMessage = messages[messages.length - 1];
    const assistantMessage = data.choices[0].message;

    try {
      await supabaseClient.from("messages").insert([
        {
          room_id: roomId,
          user_id: userId,
          role: userMessage.role,
          content: userMessage.content,
        },
        {
          room_id: roomId,
          user_id: userId,
          role: assistantMessage.role,
          content: assistantMessage.content,
        },
      ]);
    } catch (dbError) {
      // Database insert error
    }
  }

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    },
  });
});
