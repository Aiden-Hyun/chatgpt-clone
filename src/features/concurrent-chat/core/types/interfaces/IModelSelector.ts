/**
 * Interface for model selection in the concurrent chat system.
 * Follows SOLID principles with single responsibility for model management.
 * 
 * This interface defines the contract for any model selector implementation,
 * supporting model listing, current model retrieval, model setting, and room-specific models.
 */
export interface IModelSelector {
  /**
   * Get all available models for selection.
   * 
   * @returns Array of model options with label and value properties
   */
  getAvailableModels(): Array<{ label: string; value: string }>;

  /**
   * Get the currently selected model.
   * 
   * @returns String representing the current model
   */
  getCurrentModel(): string;

  /**
   * Set the current model.
   * 
   * @param model - The model to set as current
   * @returns Promise that resolves when model is set
   */
  setModel(model: string): Promise<void>;

  /**
   * Get the model for a specific room.
   * 
   * @param roomId - The room ID to get the model for
   * @returns Promise that resolves with the model for the room
   */
  getModelForRoom(roomId: number): Promise<string>;
}

/**
 * Default implementation of IModelSelector for testing purposes.
 * This provides a concrete implementation that satisfies the interface contract.
 */
export class DefaultModelSelector implements IModelSelector {
  private currentModel = 'gpt-3.5-turbo';
  private roomModels = new Map<number, string>();

  getAvailableModels(): Array<{ label: string; value: string }> {
    return [
      { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
      { label: 'GPT-4', value: 'gpt-4' }
    ];
  }

  getCurrentModel(): string {
    return this.currentModel;
  }

  async setModel(model: string): Promise<void> {
    this.currentModel = model;
    return Promise.resolve();
  }

  async getModelForRoom(roomId: number): Promise<string> {
    // Return room-specific model if set, otherwise return current model
    return Promise.resolve(this.roomModels.get(roomId) || this.currentModel);
  }
}

/**
 * Factory function to create a model selector instance.
 * This allows the tests to work with concrete implementations.
 */
export function createModelSelector(): IModelSelector {
  return new DefaultModelSelector();
} 