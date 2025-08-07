import { ICommand } from '../types/interfaces/ICommand';
import { IMessageProcessor } from '../types/interfaces/IMessageProcessor';
import { generateRequestId } from '../utils/messageIdGenerator';

export class ClearMessagesCommand implements ICommand {
  private readonly id: string;
  private readonly timestamp: number;
  private executed = false;
  private undone = false;
  private clearedMessages: any[] = [];

  constructor(
    private readonly messageProcessor: IMessageProcessor,
    private readonly roomId: number | null
  ) {
    // Validation
    if (!messageProcessor) {
      throw new Error('Message processor is required');
    }
    // Allow null and undefined room IDs to pass through

    this.id = generateRequestId();
    this.timestamp = Date.now();
  }

  async execute(): Promise<any> {
    if (this.executed) {
      // Prevent double execution - don't call processor again
      return;
    }

    try {
      const result = await this.messageProcessor.process({
        roomId: this.roomId,
        type: 'clear'
      });

      // Store cleared messages for undo functionality
      if (result && result.messages) {
        this.clearedMessages = result.messages;
      }

      this.executed = true;
      this.undone = false;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  canUndo(): boolean {
    return true; // Can undo after execution
  }

  async undo(): Promise<any> {
    if (!this.executed) {
      throw new Error('Cannot undo command that has not been executed');
    }

    if (this.undone) {
      // Already undone
      return;
    }

    try {
      const result = await this.messageProcessor.process({
        roomId: this.roomId,
        type: 'restore',
        messages: this.clearedMessages
      });

      this.undone = true;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for command metadata and state management
  getDescription(): string {
    const messageCount = this.clearedMessages.length;
    return `Clear messages: room ${this.roomId} (${messageCount} messages cleared)`;
  }

  getTimestamp(): number {
    return this.timestamp;
  }

  getId(): string {
    return this.id;
  }

  isExecuted(): boolean {
    return this.executed;
  }

  isUndone(): boolean {
    return this.undone;
  }
} 