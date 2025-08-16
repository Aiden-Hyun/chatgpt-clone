// src/features/chat/services/core/AnimationPolicy.ts
import {
    LARGE_CODE_BLOCK_THRESHOLD_CHARS,
    LONG_RESPONSE_THRESHOLD_CHARS,
    TYPING_ANIMATION_CHUNK_SIZE,
    TYPING_ANIMATION_MAX_CHUNK,
    TYPING_ANIMATION_MIN_CHUNK,
    TYPING_ANIMATION_MIN_TICK_MS,
    TYPING_ANIMATION_SPEED,
    TYPING_ANIMATION_TARGET_MS_LONG,
} from '../../constants';

export type AnimationParams = {
  speedMs: number;
  chunkSize: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function containsLargeCodeBlock(text: string): boolean {
  // Heuristic: presence of fenced blocks and overall length of fenced sections
  // We keep it simple to avoid heavy parsing here
  const fenceMatches = text.match(/```[\s\S]*?```/g);
  if (!fenceMatches) return false;
  const totalCodeLen = fenceMatches.reduce((sum, block) => sum + block.length, 0);
  return totalCodeLen >= LARGE_CODE_BLOCK_THRESHOLD_CHARS; // arbitrary heuristic threshold
}

/**
 * Computes adaptive animation parameters based on content length and structure.
 * - Short responses use default speed and chunk size
 * - Long responses target a fixed total animation time budget
 * - Code-heavy responses get a larger chunk size to avoid choppy rendering
 */
export function computeAnimationParams(fullContent: string): AnimationParams {
  const length = fullContent.length;

  // Defaults for short messages
  let baseSpeedMs = TYPING_ANIMATION_SPEED;
  let baseChunkSize = TYPING_ANIMATION_CHUNK_SIZE;

  if (length < LONG_RESPONSE_THRESHOLD_CHARS) {
    return {
      speedMs: clamp(baseSpeedMs, TYPING_ANIMATION_MIN_TICK_MS, Number.MAX_SAFE_INTEGER),
      chunkSize: clamp(baseChunkSize, TYPING_ANIMATION_MIN_CHUNK, TYPING_ANIMATION_MAX_CHUNK),
    };
  }

  // Adaptive policy for long responses
  const baseTickMs = Math.max(TYPING_ANIMATION_MIN_TICK_MS, TYPING_ANIMATION_SPEED);
  const targetTicks = Math.max(1, Math.ceil(TYPING_ANIMATION_TARGET_MS_LONG / baseTickMs));
  let chunkSize = Math.ceil(length / targetTicks);
  chunkSize = clamp(chunkSize, TYPING_ANIMATION_MIN_CHUNK, TYPING_ANIMATION_MAX_CHUNK);

  // Optionally nudge up chunk size for code-heavy content
  if (containsLargeCodeBlock(fullContent)) {
    chunkSize = clamp(Math.ceil(chunkSize * 1.5), TYPING_ANIMATION_MIN_CHUNK, TYPING_ANIMATION_MAX_CHUNK);
  }

  // Keep tick near base frame budget
  const speedMs = baseTickMs;

  return { speedMs, chunkSize };
}


