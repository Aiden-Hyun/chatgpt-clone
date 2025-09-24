// source/presentation/chat/constants/uiConstants.ts

/**
 * Heuristic threshold in characters for detecting a "large" code block that might
 * benefit from a slightly larger animation chunk size.
 */
export const LARGE_CODE_BLOCK_THRESHOLD_CHARS = 300;

/**
 * Maximum length for a message snippet displayed in the chat sidebar before it is truncated.
 */
export const SIDEBAR_SNIPPET_MAX_LENGTH = 70;

/**
 * The maximum number of attempts to poll the database for messages to account for replication lag.
 */
export const DB_MESSAGE_POLL_ATTEMPTS = 10;

/**
 * The threshold in pixels from the bottom of the message list to enable auto-scrolling.
 */
export const AUTOSCROLL_THRESHOLD_PX = 120;

/**
 * Maximum length for an image filename displayed in the Markdown renderer before truncation.
 */
export const MARKDOWN_IMAGE_FILENAME_MAX_LENGTH = 40;

/**
 * Character threshold for detecting very short code snippets, which can be rendered
 * without special formatting to avoid unnecessary visual noise.
 */
export const SHORT_CODE_SNIPPET_THRESHOLD = 5;

/**
 * Maximum length for a user's message content to be used as a new room name.
 */
export const ROOM_NAME_MAX_LENGTH = 100;

/**
 * The maximum number of retries for sending a message if the initial attempt fails.
 */
export const MESSAGE_SEND_MAX_RETRIES = 3;

/**
 * Duration in milliseconds for cursor blink animation in welcome text.
 */
export const CURSOR_BLINK_DURATION_MS = 500;

/**
 * Speed in milliseconds per character for typing animation.
 */
export const TYPING_ANIMATION_SPEED = 50;
