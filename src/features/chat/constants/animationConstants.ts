// src/features/chat/constants/animationConstants.ts

// Typing animation speed in milliseconds
export const TYPING_ANIMATION_SPEED = 8;

// Number of characters to reveal per non-whitespace step during typewriter animation
export const TYPING_ANIMATION_CHUNK_SIZE = 3;

// Adaptive animation policy constants
// Target duration window for long responses to finish animating
export const TYPING_ANIMATION_TARGET_MS_LONG = 2500;

// Minimum and maximum chunk sizes for adaptive typewriter animation
export const TYPING_ANIMATION_MIN_CHUNK = 3;
export const TYPING_ANIMATION_MAX_CHUNK = 40;

// Threshold after which adaptive policy engages (short messages use defaults)
export const LONG_RESPONSE_THRESHOLD_CHARS = 600;

// Minimum timer interval to align with frame budget and reduce CPU load
export const TYPING_ANIMATION_MIN_TICK_MS = 16;
