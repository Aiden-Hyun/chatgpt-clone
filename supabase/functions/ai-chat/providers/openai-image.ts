// @ts-nocheck
// supabase/functions/ai-chat/providers/openai-image.ts
import { config } from '../../shared/config.ts';

async function tryImagesEndpoint({ prompt, size, headers, model }: { prompt: string; size: string; headers: Record<string, string>; model: string }) {
  const res = await fetch('https://api.openai.com/v1/images', {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, prompt, size, response_format: 'url' }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('[OpenAI Images] /v1/images error', { status: res.status, body: data });
    throw new Error(data?.error?.message || `OpenAI /v1/images error: ${res.status}`);
  }
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error('OpenAI returned no image URL');
  return url;
}

async function tryGenerationsEndpoint({ prompt, size, headers, model }: { prompt: string; size: string; headers: Record<string, string>; model: string }) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers,
    body: JSON.stringify({ model, prompt, size, response_format: 'url' }),
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('[OpenAI Images] /v1/images/generations error', { status: res.status, body: data });
    throw new Error(data?.error?.message || `OpenAI /v1/images/generations error: ${res.status}`);
  }
  const url = data?.data?.[0]?.url;
  if (!url) throw new Error('OpenAI returned no image URL');
  return url;
}

export async function callOpenAIImage(prompt: string, opts?: { size?: '512x512' | '1024x1024' | '256x256'; model?: string }) {
  const OPENAI_API_KEY = config.secrets.openai.apiKey();
  const size = opts?.size ?? '1024x1024';
  const model = opts?.model ?? 'dall-e-3';
  const org = Deno.env.get('OPENAI_ORG');
  const project = Deno.env.get('OPENAI_PROJECT');

  const headers: Record<string, string> = {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
  };
  if (org) headers['OpenAI-Organization'] = org;
  if (project) headers['OpenAI-Project'] = project;

  let imageUrl: string | null = null;
  if (model.startsWith('dall-e')) {
    // DALL·E models use generations endpoint
    imageUrl = await tryGenerationsEndpoint({ prompt, size, headers, model });
  } else {
    // gpt-image models: try /v1/images first, then fallback
    try {
      imageUrl = await tryImagesEndpoint({ prompt, size, headers, model });
    } catch (e1) {
      console.warn('[OpenAI Images] /v1/images failed, trying /v1/images/generations', e1?.message);
      imageUrl = await tryGenerationsEndpoint({ prompt, size, headers, model });
    }
  }

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: `![${prompt}](${imageUrl})`,
        },
      },
    ],
    model: 'gpt-image-1',
  };
}


