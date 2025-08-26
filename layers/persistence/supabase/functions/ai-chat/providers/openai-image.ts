// @ts-nocheck
// supabase/functions/ai-chat/providers/openai-image.ts
import { config } from '../../shared/config.ts';

async function tryGenerationsEndpoint({ prompt, size, headers, model }: { prompt: string; size: string; headers: Record<string, string>; model: string }) {
  // The legacy generations endpoint is primarily for DALL·E models.
  // Some deployments reject response_format; construct body conditionally.
  const body: Record<string, unknown> = { model, prompt, size };
  if (model.startsWith('dall-e')) {
    // Return base64 to avoid private Azure URLs requiring Authorization headers
    body.response_format = 'b64_json';
  }
  try {
    console.log('[OpenAI Images] /v1/images/generations request', { model, bodyKeys: Object.keys(body) });
  } catch {}
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const raw = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(raw);
  } catch {
    console.error('[OpenAI Images] Non-JSON response from OpenAI', { status: res.status, raw: raw?.slice(0, 200) });
    throw new Error(`OpenAI images response was not JSON (status ${res.status})`);
  }
  if (!res.ok) {
    console.error('[OpenAI Images] /v1/images/generations error', { status: res.status, body: data });
    throw new Error(data?.error?.message || `OpenAI /v1/images/generations error: ${res.status}`);
  }
  const first = data?.data?.[0];
  const url = first?.url as string | undefined;
  const b64 = first?.b64_json as string | undefined;
  // Return both so caller can choose (upload to storage or inline render)
  if (b64) return { kind: 'b64', value: b64 } as const;
  if (url) return { kind: 'url', value: url } as const;
  throw new Error('OpenAI returned no image content');
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

  let imageResult: { kind: 'b64' | 'url'; value: string } | null = null;
  if (model.startsWith('dall-e')) {
    // DALL·E models use generations endpoint
    console.log('[OpenAI Images] Routing: DALL·E generations');
    imageResult = await tryGenerationsEndpoint({ prompt, size, headers, model });
  } else if (model.startsWith('gpt-image')) {
    // gpt-image-1 uses the generations endpoint (returns b64_json)
    console.log('[OpenAI Images] Routing: gpt-image /v1/images/generations');
    imageResult = await tryGenerationsEndpoint({ prompt, size, headers, model });
  } else {
    throw new Error(`Unsupported image model: ${model}`);
  }

  const imageUrl = imageResult?.kind === 'b64'
    ? `data:image/png;base64,${imageResult.value}`
    : imageResult?.value ?? '';

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: `![${prompt}](${imageUrl})`,
        },
      },
    ],
    model,
    image: imageResult?.kind === 'b64' ? { b64: imageResult.value, contentType: 'image/png' } : undefined,
  };
}


