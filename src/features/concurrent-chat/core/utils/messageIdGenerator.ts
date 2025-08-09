/*
Phase 1 Analysis — File Notes (messageIdGenerator)
- Uses Date.now + Math.random; non-monotonic under clock skew and low entropy for high concurrency.
- Consider switching to ULID for sortable, low-collision ids. Keep API shape stable for now.
*/
/**
 * Utility functions for generating unique IDs for different purposes in the concurrent chat system.
 * Each function generates IDs with a specific prefix and timestamp for easy identification and debugging.
 */

/**
 * Generates a unique ID for messages in the format: msg_timestamp_random
 * @returns A unique message ID string
 */
export function generateMessageId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `msg_${timestamp}_${random}`;
}

/**
 * Generates a unique ID for API requests in the format: req_timestamp_random
 * @returns A unique request ID string
 */
export function generateRequestId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `req_${timestamp}_${random}`;
}

/**
 * Generates a unique ID for animations in the format: anim_timestamp_random
 * @returns A unique animation ID string
 */
export function generateAnimationId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `anim_${timestamp}_${random}`;
} 