import { ICommand } from '../types/interfaces/ICommand';
import { IModelSelector } from '../types/interfaces/IModelSelector';
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
    private readonly roomId: number | null,
    private readonly contextMessages?: ConcurrentMessage[]
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
        metadata: this.contextMessages ? { context: this.contextMessages } : undefined,
      };
      console.log('[MODEL] Command.SendMessage → constructing user message', {
        roomId: this.roomId,
        model: (message as any).model || '(none)',
        contextCount: this.contextMessages ? this.contextMessages.length : 0,
      });

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

export class RetryMessageCommand implements ICommand {
  private readonly id: string;
  private readonly timestamp: number;
  private executed = false;
  private undone = false;
  private retryCount = 0;

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
        type: 'retry'
      });

      this.executed = true;
      this.undone = false;
      this.retryCount++;
      
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
        type: 'cancel'
      });

      this.undone = true;
      this.retryCount--;
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for command metadata and state management
  getDescription(): string {
    return `Retry message: ${this.messageId} (retry count: ${this.retryCount})`;
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

export class ChangeModelCommand implements ICommand {
  private readonly id: string;
  private readonly timestamp: number;
  private executed = false;
  private undone = false;
  private previousModel: string | undefined;

  constructor(
    private readonly modelSelector: IModelSelector,
    private readonly newModel: string,
    private readonly roomId: number | null
  ) {
    // Validation
    if (!modelSelector) {
      throw new Error('Model selector is required');
    }
    if (newModel === null || newModel === undefined) {
      throw new Error('New model is required');
    }

    this.id = generateRequestId();
    this.timestamp = Date.now();
  }

  async execute(): Promise<any> {
    if (this.executed) {
      // Prevent double execution - don't call selector again
      return;
    }

    try {
      // Store the previous model before changing
      this.previousModel = this.modelSelector.getCurrentModel();
      
      // Change to the new model
      await this.modelSelector.setModel(this.newModel);

      this.executed = true;
      this.undone = false;
      
      return { success: true, model: this.newModel };
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

    if (!this.previousModel) {
      throw new Error('No previous model to restore');
    }

    try {
      // Restore the previous model
      await this.modelSelector.setModel(this.previousModel);

      this.undone = true;
      
      return { success: true, model: this.previousModel };
    } catch (error) {
      throw error;
    }
  }

  // Additional methods for command metadata and state management
  getDescription(): string {
    return `Change model: ${this.newModel} in room ${this.roomId}`;
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
