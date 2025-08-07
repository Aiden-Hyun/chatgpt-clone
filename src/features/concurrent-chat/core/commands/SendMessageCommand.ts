import { ICommand } from '../types/interfaces/ICommand';
import { ConcurrentMessage, IMessageProcessor } from '../types/interfaces/IMessageProcessor';
import { generateRequestId } from '../utils/messageIdGenerator';

export class SendMessageCommand implements ICommand {
  private readonly id: string;
  private readonly timestamp: number;
  private executed = false;
  private undone = false;

  constructor(
    private readonly messageProcessor: IMessageProcessor,
    private readonly messageContent: string,
    private readonly roomId: number | null
  ) {
    // Validation
    if (!messageProcessor) {
      throw new Error('Message processor is required');
    }
    if (messageContent === null || messageContent === undefined) {
      throw new Error('Message content is required');
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
      const message: ConcurrentMessage = {
        id: this.id,
        content: this.messageContent,
        role: 'user',
        status: 'pending',
        timestamp: Date.now(),
        roomId: this.roomId,
      };

      const result = await this.messageProcessor.process(message);

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
        content: this.messageContent,
        roomId: this.roomId,
        type: 'undo'
      });

      this.undone = true;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for command metadata and state management
  getDescription(): string {
    return `Send message: "${this.messageContent}" in room ${this.roomId}`;
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