// src/features/chat/constants/asyncConstants.ts

/**
 * Delay in milliseconds before polling for messages from the database.
 * Used to account for potential replication lag.
 */
export const MESSAGE_FETCH_DELAY_MS = 500;

/**
 * Delay before the loading dots animation starts, preventing flickering for fast responses.
 */
export const LOADING_ANIMATION_START_DELAY_MS = 1500;

/**
 * Interval for the animation of the loading dots in a loading message.
 */
export const LOADING_DOT_INTERVAL_MS = 2000;

/**
 * Duration for one cycle (fade in or fade out) of the blinking cursor animation
 * in the welcome message.
 */
export const CURSOR_BLINK_DURATION_MS = 500;

/**
 * Default delay in milliseconds between retry attempts for sending a message.
 */
export const DEFAULT_RETRY_DELAY_MS = 1000;

/**
 * Threshold in milliseconds (1 minute) after which a stored optimistic message
 * is considered stale and should be cleared.
 */
export const STALE_MESSAGE_THRESHOLD_MS = 60000;
