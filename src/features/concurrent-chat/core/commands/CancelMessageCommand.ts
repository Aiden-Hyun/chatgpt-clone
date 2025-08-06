import { ICommand } from '../types/interfaces/ICommand';
import { IMessageProcessor } from '../types/interfaces/IMessageProcessor';
import { generateRequestId } from '../utils/messageIdGenerator';

export class CancelMessageCommand implements ICommand {
  private readonly id: string;
  private readonly timestamp: number;
  private executed = false;
  private undone = false;

  constructor(
    private readonly messageProcessor: IMessageProcessor,
    private readonly messageId: string
  ) {
    // Validation
    if (!messageProcessor) {
      throw new Error('Message processor is required');
    }
    if (messageId === undefined) {
      throw new Error('Message ID is required');
    }

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
        messageId: this.messageId,
        type: 'cancel'
      });

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
        messageId: this.messageId,
        type: 'resume'
      });

      this.undone = true;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for command metadata and state management
  getDescription(): string {
    return `Cancel message: ${this.messageId}`;
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