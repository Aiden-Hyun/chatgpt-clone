import { ICommand } from '../types/interfaces/ICommand';
import { IModelSelector } from '../types/interfaces/IModelSelector';

/**
 * Command to change the AI model used for chat responses.
 * Implements the Command pattern with undo/redo support.
 * 
 * This command allows changing the model globally or for a specific room,
 * and supports undoing the change to restore the previous model.
 */
export class ChangeModelCommand implements ICommand {
  private modelSelector: IModelSelector;
  private newModel: string;
  private roomId: number | null;
  private previousModel?: string;
  private executed = false;
  private undone = false;
  private executionTimestamp: number;
  private commandId: string;

  constructor(modelSelector: IModelSelector, newModel: string, roomId: number | null = null) {
    // Validate inputs
    if (!modelSelector) {
      throw new Error('Model selector is required');
    }
    if (newModel === undefined) {
      throw new Error('New model is required');
    }

    this.modelSelector = modelSelector;
    this.newModel = newModel;
    this.roomId = roomId;
    this.executionTimestamp = Date.now();
    this.commandId = `change-model-${newModel}-${roomId || 'global'}-${this.executionTimestamp}`;
  }

  /**
   * Execute the model change command.
   * Stores the previous model and changes to the new model.
   */
  async execute(): Promise<any> {
    // Prevent double execution
    if (this.executed && !this.undone) {
      return this.lastResult;
    }

    // Store the previous model for undo
    this.previousModel = this.modelSelector.getCurrentModel();

    // Change to the new model
    await this.modelSelector.setModel(this.newModel);

    this.executed = true;
    this.undone = false;
    
    const result = { success: true, model: this.newModel };
    this.lastResult = result;

    return result;
  }

  /**
   * Check if this command can be undone.
   * Model changes can always be undone.
   */
  canUndo(): boolean {
    return true;
  }

  /**
   * Undo the model change by restoring the previous model.
   */
  async undo(): Promise<any> {
    if (!this.executed) {
      throw new Error('Cannot undo command that has not been executed');
    }

    if (this.previousModel !== undefined) {
      await this.modelSelector.setModel(this.previousModel);
    }

    this.undone = true;
    return { success: true, model: this.previousModel };
  }

  /**
   * Get a human-readable description of this command.
   */
  getDescription(): string {
    if (this.roomId !== null) {
      return `Change model to ${this.newModel} for room ${this.roomId}`;
    }
    return `Change model to ${this.newModel}`;
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