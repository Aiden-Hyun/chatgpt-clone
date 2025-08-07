import { EventBus } from '../core/events/EventBus';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { MessageEvent } from '../core/types/events/MessageEvents';
import { IPlugin } from '../core/types/interfaces/ICommand';

/**
 * Base class for all plugins in the concurrent chat system
 * Provides common functionality and lifecycle management
 */
export abstract class BasePlugin implements IPlugin {
  public readonly id: string;
  public readonly name: string;
  public readonly version: string;
  
  protected eventBus: EventBus;
  protected container: ServiceContainer;
  protected state: 'initialized' | 'started' | 'stopped' | 'destroyed' = 'initialized';
  protected active: boolean = false;
  protected subscriptions: string[] = [];

  constructor(
    id: string,
    name: string,
    version: string,
    eventBus: EventBus,
    container: ServiceContainer
  ) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.eventBus = eventBus;
    this.container = container;
  }

  /**
   * Initialize the plugin
   * Override this method to perform plugin-specific initialization
   */
  abstract init(): Promise<void>;

  /**
   * Destroy the plugin
   * Override this method to perform plugin-specific cleanup
   */
  abstract destroy(): Promise<void>;

  /**
   * Get the current state of the plugin
   */
  getState(): 'initialized' | 'started' | 'stopped' | 'destroyed' {
    return this.state;
  }

  /**
   * Check if the plugin is currently active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Start the plugin
   * Sets the plugin to active state
   */
  async start(): Promise<void> {
    if (this.state === 'destroyed') {
      throw new Error(`Cannot start destroyed plugin: ${this.id}`);
    }
    
    this.active = true;
    this.state = 'started';
  }

  /**
   * Stop the plugin
   * Sets the plugin to inactive state
   */
  async stop(): Promise<void> {
    this.active = false;
    this.state = 'stopped';
  }

  /**
   * Publish an event to the event bus
   * @param event The event to publish
   */
  protected publishEvent(event: MessageEvent): void {
    if (this.active) {
      this.eventBus.publish(event.type, event);
    }
  }

  /**
   * Subscribe to an event type
   * @param eventType The event type to subscribe to
   * @param handler The event handler function
   * @param replay Whether to replay past events
   * @returns Subscription ID
   */
  protected subscribeToEvent(
    eventType: string,
    handler: (event: MessageEvent) => void | Promise<void>,
    replay: boolean = false
  ): string {
    const subscriptionId = this.eventBus.subscribe(eventType, handler, replay);
    this.subscriptions.push(subscriptionId);
    return subscriptionId;
  }

  /**
   * Unsubscribe from an event type
   * @param eventType The event type to unsubscribe from
   * @param handler The event handler function
   */
  protected unsubscribeFromEvent(
    eventType: string,
    handler: (event: MessageEvent) => void | Promise<void>
  ): void {
    this.eventBus.unsubscribe(eventType, handler);
  }

  /**
   * Unsubscribe from an event by subscription ID
   * @param subscriptionId The subscription ID to unsubscribe
   */
  protected unsubscribeById(subscriptionId: string): void {
    this.eventBus.unsubscribeById(subscriptionId);
    const index = this.subscriptions.indexOf(subscriptionId);
    if (index !== -1) {
      this.subscriptions.splice(index, 1);
    }
  }

  /**
   * Get a service from the container
   * @param key The service key
   * @returns The service instance
   */
  protected getService<T>(key: string): T {
    return this.container.get<T>(key);
  }

  /**
   * Check if a service exists in the container
   * @param key The service key
   * @returns True if the service exists
   */
  protected hasService(key: string): boolean {
    try {
      this.container.get(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clean up all subscriptions
   */
  protected cleanupSubscriptions(): void {
    this.subscriptions.forEach(subscriptionId => {
      this.eventBus.unsubscribeById(subscriptionId);
    });
    this.subscriptions = [];
  }

  /**
   * Log a message with plugin context
   * @param message The message to log
   * @param level The log level
   */
  protected log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${this.id}] ${message}`;
    
    switch (level) {
      case 'info':
        console.log(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'error':
        console.error(logMessage);
        break;
    }
  }

  /**
   * Get plugin metadata
   * @returns Plugin metadata object
   */
  getMetadata(): { id: string; name: string; version: string; state: string; active: boolean } {
    return {
      id: this.id,
      name: this.name,
      version: this.version,
      state: this.state,
      active: this.active,
    };
  }
} 