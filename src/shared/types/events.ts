// src/shared/types/events.ts

// Generic event payload type
export type EventPayload = unknown;

// Event listener function type
export type EventListener<T = EventPayload> = (payload?: T) => void;

// Event emitter interface
export interface EventEmitter {
  on<T = EventPayload>(event: string, listener: EventListener<T>): () => void;
  off(event: string, listener: EventListener): void;
  emit<T = EventPayload>(event: string, payload?: T): void;
}
