/**
 * Event Bus for the concurrent chat system.
 * Follows SOLID principles with single responsibility for event management.
 * 
 * This EventBus provides a centralized way to publish and subscribe to events,
 * supporting event history, replay functionality, and type-safe event handling.
 */
export class EventBus {
  private subscribers = new Map<string, { id: string; handler: Function; replay: boolean }[]>();
  private eventHistory: { type: string; data: any; timestamp: number }[] = [];
  private maxHistorySize: number;
  private nextSubscriptionId = 1;

  constructor(maxHistorySize: number = 100) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Subscribe to an event type.
   * 
   * @param eventType - The type of event to subscribe to
   * @param handler - The function to call when the event is published
   * @param replay - Whether to replay past events to this subscriber
   * @returns Subscription ID for unsubscribing
   */
  subscribe<T = any>(eventType: string, handler: (data: T) => void | Promise<void>, replay: boolean = false): string {
    const subscriptionId = `sub_${this.nextSubscriptionId++}`;
    
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push({ id: subscriptionId, handler, replay });
    
    // Replay past events if requested
    if (replay) {
      this.replayEvents(eventType, handler);
    }
    
    return subscriptionId;
  }

  /**
   * Publish an event to all subscribers.
   * 
   * @param eventType - The type of event to publish
   * @param data - The event data
   * @returns Promise that resolves when all handlers complete
   */
  async publish<T = any>(eventType: string, data: T): Promise<void> {
    // Add to history
    this.addToHistory(eventType, data);
    
    // Get all subscribers that match this event type (including patterns)
    const allSubscribers: { id: string; handler: Function; replay: boolean }[] = [];
    
    for (const [subscriberEventType, eventSubscribers] of this.subscribers.entries()) {
      if (this.matchesPattern(eventType, subscriberEventType)) {
        allSubscribers.push(...eventSubscribers);
      }
    }
    
    // Call all handlers
    const promises = allSubscribers.map(({ handler }) => {
      try {
        const result = handler(data);
        return result instanceof Promise ? result : Promise.resolve();
      } catch (error) {
        return Promise.reject(error);
      }
    });
    
    await Promise.all(promises);
  }

  /**
   * Unsubscribe a handler from an event type.
   * 
   * @param eventType - The type of event to unsubscribe from
   * @param handler - The handler to unsubscribe
   */
  unsubscribe(eventType: string, handler: Function): void {
    const eventSubscribers = this.subscribers.get(eventType);
    if (eventSubscribers) {
      const index = eventSubscribers.findIndex(sub => sub.handler === handler);
      if (index !== -1) {
        eventSubscribers.splice(index, 1);
      }
    }
  }

  /**
   * Unsubscribe by subscription ID.
   * 
   * @param subscriptionId - The subscription ID to unsubscribe
   */
  unsubscribeById(subscriptionId: string): void {
    for (const [eventType, eventSubscribers] of this.subscribers.entries()) {
      const index = eventSubscribers.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        eventSubscribers.splice(index, 1);
        break;
      }
    }
  }

  /**
   * Check if an event type has any subscribers.
   * 
   * @param eventType - The event type to check
   * @returns True if there are subscribers
   */
  hasSubscribers(eventType: string): boolean {
    for (const [subscriberEventType, eventSubscribers] of this.subscribers.entries()) {
      if (this.matchesPattern(eventType, subscriberEventType) && eventSubscribers.length > 0) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the event history.
   * 
   * @returns Array of past events
   */
  getEventHistory(): { type: string; data: any; timestamp: number }[] {
    return [...this.eventHistory];
  }

  /**
   * Clear the event history.
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get all event types that have subscribers.
   * 
   * @returns Array of event types
   */
  getEventTypes(): string[] {
    return Array.from(this.subscribers.keys());
  }

  /**
   * Get the number of subscribers for an event type.
   * 
   * @param eventType - The event type to check
   * @returns Number of subscribers
   */
  getSubscriberCount(eventType: string): number {
    let count = 0;
    for (const [subscriberEventType, eventSubscribers] of this.subscribers.entries()) {
      if (this.matchesPattern(eventType, subscriberEventType)) {
        count += eventSubscribers.length;
      }
    }
    return count;
  }

  /**
   * Check if an event type matches a pattern.
   * 
   * @param eventType - The actual event type
   * @param pattern - The pattern to match against
   * @returns True if the event type matches the pattern
   */
  private matchesPattern(eventType: string, pattern: string): boolean {
    // Exact match
    if (eventType === pattern) {
      return true;
    }
    
    // Pattern matching with wildcards
    if (pattern.includes('*')) {
      const patternParts = pattern.split('.');
      const eventParts = eventType.split('.');
      
      if (patternParts.length !== eventParts.length) {
        return false;
      }
      
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i] !== '*' && patternParts[i] !== eventParts[i]) {
          return false;
        }
      }
      
      return true;
    }
    
    return false;
  }

  /**
   * Add an event to the history.
   * 
   * @param eventType - The event type
   * @param data - The event data
   */
  private addToHistory(eventType: string, data: any): void {
    this.eventHistory.push({
      type: eventType,
      data,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Replay past events for a new subscriber.
   * 
   * @param eventType - The event type to replay
   * @param handler - The handler to call with past events
   */
  private replayEvents(eventType: string, handler: Function): void {
    const pastEvents = this.eventHistory.filter(event => this.matchesPattern(event.type, eventType));
    
    for (const event of pastEvents) {
      try {
        handler(event.data);
      } catch (error) {
        console.error('Error replaying event:', error);
      }
    }
  }
} 