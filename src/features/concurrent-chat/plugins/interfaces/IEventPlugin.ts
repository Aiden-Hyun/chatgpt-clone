import { MessageEvent } from '../../core/types/events/MessageEvents';

/**
 * Interface for plugins that handle events
 * Allows plugins to subscribe to and handle system events
 */
export interface IEventPlugin {
  /**
   * Handle an incoming event
   * @param event The event to handle
   */
  handleEvent(event: MessageEvent): Promise<void>;

  /**
   * Get the types of events this plugin can handle
   * @returns Array of event type strings
   */
  getEventTypes(): string[];

  /**
   * Check if this plugin can handle a specific event type
   * @param eventType The event type to check
   * @returns True if the plugin can handle this event type
   */
  canHandleEvent(eventType: string): boolean;

  /**
   * Get the priority of this plugin for event handling
   * Higher priority plugins handle events first
   * @returns Priority number (higher = higher priority)
   */
  getEventPriority(): number;
} 