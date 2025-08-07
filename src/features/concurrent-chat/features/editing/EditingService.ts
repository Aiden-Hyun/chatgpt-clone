import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { MessageEvent } from '../../core/types/events/MessageEvents';
import { ConcurrentMessage } from '../../core/types/interfaces/IMessageProcessor';
import { BasePlugin } from '../../plugins/BasePlugin';

/**
 * Editing Service Plugin
 * Handles message editing and provides editing functionality
 */
export class EditingService extends BasePlugin {
  private editingSessions = new Map<string, {
    originalMessage: ConcurrentMessage;
    editedContent: string;
    isActive: boolean;
    timestamp: number;
  }>();
  private autoSaveInterval: number = 5000; // 5 seconds
  private autoSaveEnabled: boolean = true;

  constructor(eventBus: EventBus, container: ServiceContainer) {
    super('editing-service', 'Editing Service', '1.0.0', eventBus, container);
  }

  async init(): Promise<void> {
    try {
      this.log('Initializing Editing Service');
      
      // Set up event subscriptions
      this.setupEventSubscriptions();
      
      // Start auto-save timer
      this.startAutoSaveTimer();
      
      this.log('Editing Service initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize Editing Service: ${error}`, 'error');
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.log('Destroying Editing Service');
      
      // Stop auto-save timer
      this.stopAutoSaveTimer();
      
      // Save all active editing sessions
      await this.saveAllEditingSessions();
      
      // Clean up event subscriptions
      this.cleanupSubscriptions();
      
      this.log('Editing Service destroyed successfully');
    } catch (error) {
      this.log(`Failed to destroy Editing Service: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Start editing a message
   */
  startEditing(messageId: string, originalMessage: ConcurrentMessage): void {
    if (this.editingSessions.has(messageId)) {
      throw new Error(`Editing session already exists for message: ${messageId}`);
    }

    this.editingSessions.set(messageId, {
      originalMessage,
      editedContent: originalMessage.content,
      isActive: true,
      timestamp: Date.now(),
    });

    this.log(`Started editing session for message: ${messageId}`);

    // Publish editing started event
    this.publishEvent({
      type: 'EDITING_STARTED',
      timestamp: Date.now(),
      messageId,
      originalContent: originalMessage.content,
    });
  }

  /**
   * Update the edited content for a message
   */
  updateEditedContent(messageId: string, newContent: string): void {
    const session = this.editingSessions.get(messageId);
    if (!session) {
      throw new Error(`No editing session found for message: ${messageId}`);
    }

    session.editedContent = newContent;
    session.timestamp = Date.now();

    this.log(`Updated edited content for message: ${messageId}`);
  }

  /**
   * Save the edited message
   */
  async saveEditedMessage(messageId: string): Promise<ConcurrentMessage> {
    const session = this.editingSessions.get(messageId);
    if (!session) {
      throw new Error(`No editing session found for message: ${messageId}`);
    }

    try {
      this.log(`Saving edited message: ${messageId}`);

      // Create the edited message
      const editedMessage: ConcurrentMessage = {
        ...session.originalMessage,
        content: session.editedContent,
        timestamp: Date.now(),
        metadata: {
          ...session.originalMessage.metadata,
          edited: true,
          originalContent: session.originalMessage.content,
          editTimestamp: Date.now(),
        },
      };

      // Publish editing saved event
      this.publishEvent({
        type: 'EDITING_SAVED',
        timestamp: Date.now(),
        messageId,
        originalContent: session.originalMessage.content,
        editedContent: session.editedContent,
        editedMessage,
      });

      // Remove the editing session
      this.editingSessions.delete(messageId);

      this.log(`Successfully saved edited message: ${messageId}`);
      return editedMessage;

    } catch (error) {
      this.log(`Failed to save edited message ${messageId}: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Cancel editing for a message
   */
  cancelEditing(messageId: string): void {
    const session = this.editingSessions.get(messageId);
    if (!session) {
      throw new Error(`No editing session found for message: ${messageId}`);
    }

    this.editingSessions.delete(messageId);

    this.log(`Cancelled editing for message: ${messageId}`);

    // Publish editing cancelled event
    this.publishEvent({
      type: 'EDITING_CANCELLED',
      timestamp: Date.now(),
      messageId,
      originalContent: session.originalMessage.content,
    });
  }

  /**
   * Get the current editing session for a message
   */
  getEditingSession(messageId: string): {
    originalMessage: ConcurrentMessage;
    editedContent: string;
    isActive: boolean;
    timestamp: number;
  } | undefined {
    return this.editingSessions.get(messageId);
  }

  /**
   * Check if a message is currently being edited
   */
  isEditing(messageId: string): boolean {
    return this.editingSessions.has(messageId);
  }

  /**
   * Get all active editing sessions
   */
  getActiveEditingSessions(): string[] {
    return Array.from(this.editingSessions.keys());
  }

  /**
   * Get the number of active editing sessions
   */
  getActiveEditingCount(): number {
    return this.editingSessions.size;
  }

  /**
   * Enable or disable auto-save
   */
  setAutoSaveEnabled(enabled: boolean): void {
    this.autoSaveEnabled = enabled;
    this.log(`Auto-save ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if auto-save is enabled
   */
  isAutoSaveEnabled(): boolean {
    return this.autoSaveEnabled;
  }

  /**
   * Set the auto-save interval in milliseconds
   */
  setAutoSaveInterval(interval: number): void {
    this.autoSaveInterval = Math.max(1000, interval); // Minimum 1 second
    this.log(`Set auto-save interval to: ${this.autoSaveInterval}ms`);
  }

  /**
   * Get the auto-save interval in milliseconds
   */
  getAutoSaveInterval(): number {
    return this.autoSaveInterval;
  }

  /**
   * Save all active editing sessions
   */
  async saveAllEditingSessions(): Promise<ConcurrentMessage[]> {
    const messageIds = Array.from(this.editingSessions.keys());
    const savedMessages: ConcurrentMessage[] = [];

    for (const messageId of messageIds) {
      try {
        const savedMessage = await this.saveEditedMessage(messageId);
        savedMessages.push(savedMessage);
      } catch (error) {
        this.log(`Failed to save editing session for message ${messageId}: ${error}`, 'error');
      }
    }

    this.log(`Saved ${savedMessages.length} editing sessions`);
    return savedMessages;
  }

  /**
   * Get editing service statistics
   */
  getEditingStats(): {
    activeEditingSessions: number;
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    totalSessions: number;
  } {
    return {
      activeEditingSessions: this.editingSessions.size,
      autoSaveEnabled: this.autoSaveEnabled,
      autoSaveInterval: this.autoSaveInterval,
      totalSessions: this.editingSessions.size,
    };
  }

  private setupEventSubscriptions(): void {
    // Subscribe to message events that might affect editing
    this.subscribeToEvent('MESSAGE_CANCELLED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_CANCELLED') {
        // Cancel editing for cancelled message
        if (this.isEditing(event.messageId!)) {
          this.cancelEditing(event.messageId!);
        }
      }
    });

    this.subscribeToEvent('MESSAGE_DELETED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_DELETED') {
        // Cancel editing for deleted message
        if (this.isEditing(event.messageId!)) {
          this.cancelEditing(event.messageId!);
        }
      }
    });
  }

  private startAutoSaveTimer(): void {
    if (!this.autoSaveEnabled) return;

    setInterval(async () => {
      if (this.autoSaveEnabled && this.editingSessions.size > 0) {
        try {
          await this.saveAllEditingSessions();
        } catch (error) {
          this.log(`Auto-save failed: ${error}`, 'error');
        }
      }
    }, this.autoSaveInterval);
  }

  private stopAutoSaveTimer(): void {
    // Note: In a real implementation, you'd need to store the interval ID
    // and clear it properly. This is a simplified version.
  }
} 