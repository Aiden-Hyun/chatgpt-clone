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

  console.log(`[EDGE] Function called at ${new Date().toISOString()}`);
  console.log(`[EDGE] Request method: ${req.method}`);

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
    console.log(`[EDGE] Request body keys: ${Object.keys(body)}`);
    console.log(`[EDGE] Search query received: ${body.searchQuery || 'NOT PROVIDED'}`);
    
    const { model, messages, roomId, clientMessageId, skipPersistence, searchQuery } = body;

    // --- Authentication ---
    const authHeader = req.headers.get("authorization");
    if (!authHeader) throw new Error("Missing authorization header");
    
    const supabaseClient = createClient(config.secrets.supabase.url(), config.secrets.supabase.anonKey(), {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Invalid JWT");

    console.log(`[ROUTER] Received model: ${model}`);

    // --- Search Functionality ---
    let searchResults = null;
    if (searchQuery) {
      console.log(`[ROUTER] Performing search for: "${searchQuery}"`);
      try {
        searchResults = await performGoogleSearch(searchQuery);
        console.log(`[ROUTER] Search completed with ${searchResults?.length || 0} results`);
        
        // Log detailed search results
        if (searchResults && searchResults.length > 0) {
          console.log(`[ROUTER] === SEARCH RESULTS DETAILS ===`);
          searchResults.forEach((result, index) => {
            console.log(`[ROUTER] Result ${index + 1}:`);
            console.log(`[ROUTER]   Title: ${result.title}`);
            console.log(`[ROUTER]   Snippet: ${result.snippet}`);
            console.log(`[ROUTER]   Source: ${result.source}`);
            console.log(`[ROUTER]   URL: ${result.url}`);
            console.log(`[ROUTER]   ---`);
          });
          console.log(`[ROUTER] === END SEARCH RESULTS ===`);
        } else {
          console.log(`[ROUTER] No search results returned`);
        }
      } catch (searchError) {
        console.error('[ROUTER] Search failed:', searchError);
        // Continue without search results
      }
    }

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
      const enhancedMessages = searchResults ? enhanceMessagesWithSearch(messages, searchResults, searchQuery) : messages;
      
      // Log the final message that will be sent to AI
      console.log('[ROUTER] === FINAL MESSAGE TO AI ===');
      const lastUserMessage = enhancedMessages.find(msg => msg.role === 'user');
      if (lastUserMessage) {
        console.log('[ROUTER] User message content:');
        console.log(lastUserMessage.content);
        console.log('[ROUTER] Message length:', lastUserMessage.content.length);
      }
      console.log('[ROUTER] === END FINAL MESSAGE ===');
      console.log("Enhanced Messages:", enhancedMessages );
      
      
      responseData = await callOpenAI(model, enhancedMessages);
      console.log("responseData:", responseData);
    } else if (model.startsWith('claude-')) {
      console.log('[ROUTER] Routing to Anthropic...');
      const enhancedMessages = searchResults ? enhanceMessagesWithSearch(messages, searchResults, searchQuery) : messages;
      
      // Log the final message that will be sent to AI
      console.log('[ROUTER] === FINAL MESSAGE TO AI ===');
      const lastUserMessage = enhancedMessages.find(msg => msg.role === 'user');
      if (lastUserMessage) {
        console.log('[ROUTER] User message content:');
        console.log(lastUserMessage.content);
        console.log('[ROUTER] Message length:', lastUserMessage.content.length);
      }
      console.log('[ROUTER] === END FINAL MESSAGE ===');
      
      responseData = await callAnthropic(model, enhancedMessages);
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

// Helper function to perform Google Custom Search
async function performGoogleSearch(query: string) {
  console.log(`[GoogleSearch] Starting search for: "${query}"`);
  
  const apiKey = config.secrets.google.apiKey();
  const searchEngineId = '4415b473618724a6b';
  
  console.log(`[GoogleSearch] API Key available: ${!!apiKey}`);
  console.log(`[GoogleSearch] Search Engine ID: ${searchEngineId}`);
  
  if (!apiKey) {
    throw new Error('Google Cloud API key not found');
  }

  const params = new URLSearchParams({
    key: apiKey,
    cx: searchEngineId,
    q: query,
    num: '5', // Limit to 5 results
  });

  const url = `https://www.googleapis.com/customsearch/v1?${params.toString()}`;
  console.log(`[GoogleSearch] Making request to: ${url.replace(apiKey, '***HIDDEN***')}`);

  const response = await fetch(url);
  
  console.log(`[GoogleSearch] Response status: ${response.status}`);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[GoogleSearch] API error response: ${errorText}`);
    throw new Error(`Google Search API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`[GoogleSearch] Response data keys: ${Object.keys(data)}`);
  
  if (!data.items || !Array.isArray(data.items)) {
    console.log(`[GoogleSearch] No items in response or items is not an array`);
    console.log(`[GoogleSearch] Response structure:`, JSON.stringify(data, null, 2));
    return [];
  }

  console.log(`[GoogleSearch] Found ${data.items.length} items`);
  
  const results = data.items.map((item: any) => ({
    title: item.title,
    snippet: item.snippet,
    url: item.link,
    source: item.displayLink || 'Google Search',
    timestamp: new Date().toISOString(),
  }));
  
  console.log(`[GoogleSearch] Processed ${results.length} results`);
  return results;
}

// Helper function to enhance messages with search results
function enhanceMessagesWithSearch(messages: any[], searchResults: any[], searchQuery: string) {
  console.log(`[MessageEnhancement] Starting message enhancement`);
  console.log(`[MessageEnhancement] Search results count: ${searchResults?.length || 0}`);
  console.log(`[MessageEnhancement] Search query: "${searchQuery}"`);
  
  if (!searchResults || searchResults.length === 0) {
    console.log(`[MessageEnhancement] No search results, returning original messages`);
    return messages;
  }

  // Find the last user message and enhance it
  const enhancedMessages = [...messages];
  const lastUserMessageIndex = enhancedMessages.findIndex(msg => msg.role === 'user');
  
  console.log(`[MessageEnhancement] Last user message index: ${lastUserMessageIndex}`);
  
  if (lastUserMessageIndex !== -1) {
    const searchContext = `Search Results for "${searchQuery}":\n${searchResults.map((result, index) => 
      `${index + 1}. ${result.title}\n   ${result.snippet}\n   Source: ${result.source}\n   URL: ${result.url}\n`
    ).join('\n')}`;

    const originalContent = enhancedMessages[lastUserMessageIndex].content;
    const enhancedContent = `${originalContent}\n\n🔍 Search Results Found:\n${searchResults.length} results from ${searchResults[0]?.source || 'web search'}\n\n${searchContext}`;
    
    console.log(`[MessageEnhancement] Original content length: ${originalContent.length}`);
    console.log(`[MessageEnhancement] Enhanced content length: ${enhancedContent.length}`);
    console.log(`[MessageEnhancement] Enhanced content preview: ${enhancedContent.substring(0, 200)}...`);

    enhancedMessages[lastUserMessageIndex] = {
      ...enhancedMessages[lastUserMessageIndex],
      content: enhancedContent
    };
    
    console.log(`[MessageEnhancement] Message enhanced successfully`);
  } else {
    console.log(`[MessageEnhancement] No user message found to enhance`);
  }

  return enhancedMessages;
}
