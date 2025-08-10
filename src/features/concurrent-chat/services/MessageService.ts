import { EventBus } from '../core/events/EventBus';
import { IMessageProcessor } from '../core/types/interfaces/IMessageProcessor';

export class MessageService {
  private commandHistory: any[] = [];
  private processingMessages: Set<string> = new Set();
  private readonly maxHistorySize: number;

  constructor(
    private messageProcessor: IMessageProcessor,
    private eventBus: EventBus,
    maxHistorySize: number = 100
  ) {
    if (!messageProcessor) {
      throw new Error('Message processor is required');
    }
    if (!eventBus) {
      throw new Error('Event bus is required');
    }
    
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Send a message.
   * 
   * @param content - The message content
   * @param roomId - The room ID
   * @returns Promise that resolves to the processing result
   */
  async sendMessage(content: string, roomId: number | null): Promise<any> {
    try {
      const result = await this.messageProcessor.process({
        content,
        roomId,
        type: 'send'
      });

      if (result && result.messageId) {
        this.processingMessages.add(result.messageId);
        
        // Add to command history
        this.addToHistory({
          type: 'send',
          content,
          roomId,
          messageId: result.messageId,
          timestamp: Date.now()
        });

        // Publish event
        this.eventBus.publish('message.sent', {
          content,
          roomId,
          messageId: result.messageId
        });
      } else {
        // If no messageId returned, create a unique one for tracking
        const uniqueId = `msg_${Date.now()}_${Math.random()}`;
        this.processingMessages.add(uniqueId);
        
        // Add to command history
        this.addToHistory({
          type: 'send',
          content,
          roomId,
          messageId: uniqueId,
          timestamp: Date.now()
        });

        // Publish event
        this.eventBus.publish('message.sent', {
          content,
          roomId,
          messageId: uniqueId
        });
      }

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel a message.
   * 
   * @param messageId - The message ID to cancel
   * @returns Promise that resolves to the cancellation result
   */
  async cancelMessage(messageId: string): Promise<any> {
    try {
      const result = await this.messageProcessor.process({
        messageId,
        type: 'cancel'
      });

      // Remove from processing messages
      this.processingMessages.delete(messageId);

      // Add to command history
      this.addToHistory({
        type: 'cancel',
        messageId,
        timestamp: Date.now()
      });

      // Publish event
      this.eventBus.publish('message.cancelled', {
        messageId
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retry a message.
   * 
   * @param messageId - The message ID to retry
   * @returns Promise that resolves to the retry result
   */
  async retryMessage(messageId: string): Promise<any> {
    try {
      const result = await this.messageProcessor.process({
        messageId,
        type: 'retry'
      });

      // Always add the retry messageId to processing (even if it's the same)
      this.processingMessages.add(messageId);

      // Add to command history
      this.addToHistory({
        type: 'retry',
        messageId,
        timestamp: Date.now()
      });

      // Publish event
      this.eventBus.publish('message.retried', {
        messageId
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear messages for a room.
   * 
   * @param roomId - The room ID to clear messages for
   * @returns Promise that resolves to the clear result
   */
  async clearMessages(roomId: number): Promise<any> {
    try {
      const result = await this.messageProcessor.process({
        roomId,
        type: 'clear'
      });

      // Add to command history
      this.addToHistory({
        type: 'clear',
        roomId,
        timestamp: Date.now()
      });

      // Publish event
      this.eventBus.publish('messages.cleared', {
        roomId
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Undo the last command.
   * 
   * @returns Promise that resolves to the undo result
   */
  async undoLastCommand(): Promise<any> {
    if (this.commandHistory.length === 0) {
      throw new Error('No commands to undo');
    }

    try {
      const lastCommand = this.commandHistory[this.commandHistory.length - 1];
      
      // Extract only the essential properties for undo, excluding messageId and timestamp
      const undoData: any = {
        type: 'undo'
      };
      
      if (lastCommand.content !== undefined) undoData.content = lastCommand.content;
      if (lastCommand.roomId !== undefined) undoData.roomId = lastCommand.roomId;
      
      const result = await this.messageProcessor.process(undoData);

      // Remove from history
      this.commandHistory.pop();

      // Publish event
      this.eventBus.publish('command.undone', {
        commandType: lastCommand.type
      });

      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove a message from processing.
   * 
   * @param messageId - The message ID to remove from processing
   */
  removeFromProcessing(messageId: string): void {
    this.processingMessages.delete(messageId);
  }

  /**
   * Get the command history.
   * 
   * @returns Array of command history entries
   */
  getCommandHistory(): any[] {
    return [...this.commandHistory];
  }

  /**
   * Clear the command history.
   */
  clearCommandHistory(): void {
    this.commandHistory = [];
  }

  /**
   * Get the count of processing messages.
   * 
   * @returns Number of messages currently being processed
   */
  getProcessingMessagesCount(): number {
    return this.processingMessages.size;
  }

  /**
   * Check if a message is currently being processed.
   * 
   * @param messageId - The message ID to check
   * @returns True if the message is being processed
   */
  isMessageProcessing(messageId: string): boolean {
    return this.processingMessages.has(messageId);
  }

  /**
   * Subscribe to message events.
   * 
   * @param callback - The callback function
   * @returns Subscription ID
   */
  subscribeToEvents(callback: (data: any) => void): string {
    return this.eventBus.subscribe('message.*', callback);
  }

  /**
   * Unsubscribe from message events.
   * 
   * @param subscriptionId - The subscription ID to unsubscribe
   */
  unsubscribeFromEvents(subscriptionId: string): void {
    this.eventBus.unsubscribeById(subscriptionId);
  }

  /**
   * Add a command to the history, maintaining the size limit.
   * 
   * @param command - The command to add
   */
  private addToHistory(command: any): void {
    this.commandHistory.push(command);
    
    // Maintain history size limit
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory.shift();
    }
  }

  /**
   * Get the message processor.
   * 
   * @returns The message processor instance
   */
  getMessageProcessor(): IMessageProcessor {
    return this.messageProcessor;
  }

  /**
   * Get the event bus.
   * 
   * @returns The event bus instance
   */
  getEventBus(): EventBus {
    return this.eventBus;
  }
} 