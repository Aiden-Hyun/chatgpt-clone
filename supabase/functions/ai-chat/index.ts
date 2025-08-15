/* eslint-disable import/no-unresolved */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "../shared/config.ts";
import { callAnthropic } from "./providers/anthropic.ts";
import { callOpenAIImage } from "./providers/openai-image.ts";
import { callOpenAI } from "./providers/openai.ts";

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
    if (model === 'gpt-image-1' || model.startsWith('gpt-image') || model === 'dall-e-3' || model.startsWith('dall-e')) {
      console.log('[ROUTER] Routing to OpenAI Images...');
      const prompt = messages?.slice().reverse().find((m: any) => m.role === 'user')?.content ?? '';
      responseData = await callOpenAIImage(prompt, { model });

      // If we received base64 image content, upload it to Supabase Storage for a stable URL
      try {
        const b64 = responseData?.image?.b64 as string | undefined;
        const contentType = responseData?.image?.contentType as string | undefined;
        if (b64 && user?.id && roomId) {
          const serviceClient = createClient(config.secrets.supabase.url(), config.secrets.supabase.serviceRoleKey());
          const binary = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
          const filename = `${user.id}/${roomId}/${clientMessageId || Date.now()}.png`;
          const uploadRes = await serviceClient.storage.from('generated-images').upload(filename, binary, {
            contentType: contentType || 'image/png',
            upsert: true,
          });
          if (uploadRes.error) throw uploadRes.error;
          const { data: pub } = serviceClient.storage.from('generated-images').getPublicUrl(filename);
          const publicUrl = pub?.publicUrl;
          if (publicUrl) {
            responseData.choices[0].message.content = `![${prompt}](${publicUrl})`;
          }
        }
      } catch (e) {
        console.error('[ROUTER] Failed to upload image to Storage; falling back to inline data URI', { message: e?.message });
      }
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
    try {
      console.error('[EDGE] Error processing request', { message: error?.message, stack: error?.stack });
    } catch (_e) {
      console.error('[EDGE] Error processing request (non-standard error object)');
    }
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": ALLOWED_ORIGIN },
    });
  }
});
