import { ConcurrentMessage } from '../interfaces/IMessageProcessor';

/**
 * Base interface for all message events
 */
export interface BaseMessageEvent {
  type: string;
  timestamp: number;
  messageId?: string;
  roomId?: number;
}

/**
 * Event fired when a message is sent
 */
export interface MessageSentEvent extends BaseMessageEvent {
  type: 'MESSAGE_SENT';
  message: ConcurrentMessage;
  content: string;
  model: string;
}

/**
 * Event fired when a message starts processing
 */
export interface MessageProcessingEvent extends BaseMessageEvent {
  type: 'MESSAGE_PROCESSING';
  message: ConcurrentMessage;
}

/**
 * Event fired when a message is completed
 */
export interface MessageCompletedEvent extends BaseMessageEvent {
  type: 'MESSAGE_COMPLETED';
  message: ConcurrentMessage;
  response: string;
}

/**
 * Event fired when a message fails
 */
export interface MessageFailedEvent extends BaseMessageEvent {
  type: 'MESSAGE_FAILED';
  message: ConcurrentMessage;
  error: string;
  retryable: boolean;
}

/**
 * Event fired when a message is cancelled
 */
export interface MessageCancelledEvent extends BaseMessageEvent {
  type: 'MESSAGE_CANCELLED';
  message: ConcurrentMessage;
}

/**
 * Event fired when a message is retried
 */
export interface MessageRetriedEvent extends BaseMessageEvent {
  type: 'MESSAGE_RETRIED';
  message: ConcurrentMessage;
  originalMessageId: string;
}

/**
 * Event fired when messages are cleared
 */
export interface MessagesClearedEvent extends BaseMessageEvent {
  type: 'MESSAGES_CLEARED';
  roomId: number;
  clearedCount: number;
}

/**
 * Event fired when the model is changed
 */
export interface ModelChangedEvent extends BaseMessageEvent {
  type: 'MODEL_CHANGED';
  oldModel: string;
  newModel: string;
  roomId?: number;
}

/**
 * Event fired when streaming starts
 */
export interface StreamingStartedEvent extends BaseMessageEvent {
  type: 'STREAMING_STARTED';
  message: ConcurrentMessage;
}

/**
 * Event fired when streaming receives a chunk
 */
export interface StreamingChunkEvent extends BaseMessageEvent {
  type: 'STREAMING_CHUNK';
  message: ConcurrentMessage;
  chunk: string;
  isComplete: boolean;
}

/**
 * Event fired when streaming ends
 */
export interface StreamingEndedEvent extends BaseMessageEvent {
  type: 'STREAMING_ENDED';
  message: ConcurrentMessage;
  finalContent: string;
}

/**
 * Event fired when animation starts
 */
export interface AnimationStartedEvent extends BaseMessageEvent {
  type: 'ANIMATION_STARTED';
  message: ConcurrentMessage;
  animationType: string;
}

/**
 * Event fired when animation completes
 */
export interface AnimationCompletedEvent extends BaseMessageEvent {
  type: 'ANIMATION_COMPLETED';
  message: ConcurrentMessage;
  animationType: string;
}

/**
 * Event fired when regeneration is requested
 */
export interface RegenerationRequestedEvent extends BaseMessageEvent {
  type: 'REGENERATION_REQUESTED';
  message: ConcurrentMessage;
}

/**
 * Event fired when editing starts
 */
export interface EditingStartedEvent extends BaseMessageEvent {
  type: 'EDITING_STARTED';
  message: ConcurrentMessage;
}

/**
 * Event fired when editing is saved
 */
export interface EditingSavedEvent extends BaseMessageEvent {
  type: 'EDITING_SAVED';
  message: ConcurrentMessage;
  newContent: string;
}

/**
 * Event fired when editing is cancelled
 */
export interface EditingCancelledEvent extends BaseMessageEvent {
  type: 'EDITING_CANCELLED';
  message: ConcurrentMessage;
}

/**
 * Union type for all message events
 */
export type MessageEvent =
  | MessageSentEvent
  | MessageProcessingEvent
  | MessageCompletedEvent
  | MessageFailedEvent
  | MessageCancelledEvent
  | MessageRetriedEvent
  | MessagesClearedEvent
  | ModelChangedEvent
  | StreamingStartedEvent
  | StreamingChunkEvent
  | StreamingEndedEvent
  | AnimationStartedEvent
  | AnimationCompletedEvent
  | RegenerationRequestedEvent
  | EditingStartedEvent
  | EditingSavedEvent
  | EditingCancelledEvent;

/**
 * Event type constants for easy reference
 */
export const MESSAGE_EVENT_TYPES = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_PROCESSING: 'MESSAGE_PROCESSING',
  MESSAGE_COMPLETED: 'MESSAGE_COMPLETED',
  MESSAGE_FAILED: 'MESSAGE_FAILED',
  MESSAGE_CANCELLED: 'MESSAGE_CANCELLED',
  MESSAGE_RETRIED: 'MESSAGE_RETRIED',
  MESSAGES_CLEARED: 'MESSAGES_CLEARED',
  MODEL_CHANGED: 'MODEL_CHANGED',
  STREAMING_STARTED: 'STREAMING_STARTED',
  STREAMING_CHUNK: 'STREAMING_CHUNK',
  STREAMING_ENDED: 'STREAMING_ENDED',
  ANIMATION_STARTED: 'ANIMATION_STARTED',
  ANIMATION_COMPLETED: 'ANIMATION_COMPLETED',
  REGENERATION_REQUESTED: 'REGENERATION_REQUESTED',
  EDITING_STARTED: 'EDITING_STARTED',
  EDITING_SAVED: 'EDITING_SAVED',
  EDITING_CANCELLED: 'EDITING_CANCELLED',
} as const;

/**
 * Type guard to check if an event is a specific type
 */
export function isMessageEventType<T extends MessageEvent>(
  event: MessageEvent,
  type: T['type']
): event is T {
  return event.type === type;
} 