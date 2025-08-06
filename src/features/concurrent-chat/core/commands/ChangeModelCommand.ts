import { ICommand } from '../types/interfaces/ICommand';
import { IModelSelector } from '../types/interfaces/IModelSelector';
import { generateRequestId } from '../utils/messageIdGenerator';

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