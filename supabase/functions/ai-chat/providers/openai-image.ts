// @ts-nocheck
// supabase/functions/ai-chat/providers/openai-image.ts
import { config } from '../../shared/config.ts';

function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function callOpenAIImage(prompt: string, opts?: { size?: '512x512' | '1024x1024' | '256x256', format?: 'png' | 'webp' }) {
  const OPENAI_API_KEY = config.secrets.openai.apiKey();
  const size = opts?.size ?? '1024x1024';
  const imageFormat = opts?.format ?? 'png';

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt,
      size,
      response_format: 'b64_json',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error('OpenAI Images API error', { status: response.status, error: data?.error?.message });
    throw new Error(data?.error?.message || 'OpenAI Images API error');
  }

  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error('No image payload received from OpenAI');
  }

  // Upload to Supabase Storage for stable public URL
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
  const serviceClient = createClient(
    config.secrets.supabase.url(),
    config.secrets.supabase.serviceRoleKey()
  );

  const bytes = base64ToUint8Array(b64);
  const ext = imageFormat === 'webp' ? 'webp' : 'png';
  const path = `generated/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  // Ensure bucket exists (best-effort)
  try {
    // Will throw if bucket exists already; ignore
    // @ts-ignore
    await serviceClient.storage.createBucket('generated-images', { public: true });
  } catch (_err) {
    // Ignore errors from existing bucket
  }

  const { error: uploadError } = await serviceClient.storage
    .from('generated-images')
    .upload(path, bytes, {
      contentType: imageFormat === 'webp' ? 'image/webp' : 'image/png',
      upsert: false,
    });
  if (uploadError) {
    console.error('Supabase Storage upload error', uploadError);
    // Fallback: return as data URL (not ideal on mobile, but ensures UX continuity)
    const dataUrl = `data:image/${ext};base64,${b64}`;
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: `![${prompt}](${dataUrl})`,
          },
        },
      ],
      model: 'gpt-image-1',
    };
  }

  const { data: pub } = serviceClient.storage.from('generated-images').getPublicUrl(path);
  const publicUrl = pub?.publicUrl;

  return {
    choices: [
      {
        message: {
          role: 'assistant',
          content: publicUrl ? `![${prompt}](${publicUrl})` : 'Image generated, but URL is unavailable.',
        },
      },
    ],
    model: 'gpt-image-1',
  };
}


