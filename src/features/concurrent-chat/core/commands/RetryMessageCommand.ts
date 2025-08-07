import { ICommand } from '../types/interfaces/ICommand';
import { IMessageProcessor } from '../types/interfaces/IMessageProcessor';

/**
 * Command to retry a failed or cancelled message.
 * Implements the Command pattern with undo/redo support.
 * 
 * This command allows retrying messages that have failed or been cancelled,
 * and supports undoing the retry (cancelling the retried message).
 * Tracks retry count for monitoring purposes.
 */
export class RetryMessageCommand implements ICommand {
  private messageProcessor: IMessageProcessor;
  private messageId: string;
  private retryCount = 0;
  private executed = false;
  private undone = false;
  private executionTimestamp: number;
  private commandId: string;

  constructor(messageProcessor: IMessageProcessor, messageId: string) {
    // Validate inputs
    if (!messageProcessor) {
      throw new Error('Message processor is required');
    }
    if (messageId === undefined) {
      throw new Error('Message ID is required');
    }

    this.messageProcessor = messageProcessor;
    this.messageId = messageId;
    this.executionTimestamp = Date.now();
    this.commandId = `retry-${messageId}-${this.executionTimestamp}`;
  }

  /**
   * Execute the retry command.
   * Calls the message processor to retry the specified message.
   */
  async execute(): Promise<any> {
    // Prevent double execution
    if (this.executed && !this.undone) {
      return this.lastResult;
    }

    const result = await this.messageProcessor.process({
      messageId: this.messageId,
      type: 'retry'
    });

    this.retryCount++;
    this.executed = true;
    this.undone = false;
    this.lastResult = result;

    return result;
  }

  /**
   * Check if this command can be undone.
   * Retry commands can be undone (by cancelling the retried message).
   */
  canUndo(): boolean {
    return true;
  }

  /**
   * Undo the retry by cancelling the message.
   */
  async undo(): Promise<any> {
    if (!this.executed) {
      throw new Error('Cannot undo command that has not been executed');
    }

    const result = await this.messageProcessor.process({
      messageId: this.messageId,
      type: 'cancel'
    });

    this.retryCount--;
    this.undone = true;
    return result;
  }

  /**
   * Get a human-readable description of this command.
   */
  getDescription(): string {
    return `Retry message ${this.messageId}${this.retryCount > 0 ? ` (retry count: ${this.retryCount})` : ''}`;
  }

  /**
   * Get the timestamp when this command was created.
   */
  getTimestamp(): number {
    return this.executionTimestamp;
  }

  /**
   * Get the unique ID of this command.
   */
  getId(): string {
    return this.commandId;
  }

  /**
   * Check if this command has been executed.
   */
  isExecuted(): boolean {
    return this.executed;
  }

  /**
   * Check if this command has been undone.
   */
  isUndone(): boolean {
    return this.undone;
  }

  private lastResult: any;
}