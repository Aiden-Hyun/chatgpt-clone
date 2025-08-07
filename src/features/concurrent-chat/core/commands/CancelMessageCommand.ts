import { ICommand } from '../types/interfaces/ICommand';
import { IMessageProcessor } from '../types/interfaces/IMessageProcessor';

/**
 * Command to cancel a message that is currently being processed.
 * Implements the Command pattern with undo/redo support.
 * 
 * This command allows cancelling messages that are in pending or processing state,
 * and supports undoing the cancellation (resuming the message).
 */
export class CancelMessageCommand implements ICommand {
  private messageProcessor: IMessageProcessor;
  private messageId: string;
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
    this.commandId = `cancel-${messageId}-${this.executionTimestamp}`;
  }

  /**
   * Execute the cancellation command.
   * Calls the message processor to cancel the specified message.
   */
  async execute(): Promise<any> {
    // Prevent double execution
    if (this.executed && !this.undone) {
      return this.lastResult;
    }

    const result = await this.messageProcessor.process({
      messageId: this.messageId,
      type: 'cancel'
    });

    this.executed = true;
    this.undone = false;
    this.lastResult = result;

    return result;
  }

  /**
   * Check if this command can be undone.
   * Cancellation commands can be undone (by resuming the message).
   */
  canUndo(): boolean {
    return true;
  }

  /**
   * Undo the cancellation by resuming the message.
   */
  async undo(): Promise<any> {
    if (!this.executed) {
      throw new Error('Cannot undo command that has not been executed');
    }

    const result = await this.messageProcessor.process({
      messageId: this.messageId,
      type: 'resume'
    });

    this.undone = true;
    return result;
  }

  /**
   * Get a human-readable description of this command.
   */
  getDescription(): string {
    return `Cancel message ${this.messageId}`;
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