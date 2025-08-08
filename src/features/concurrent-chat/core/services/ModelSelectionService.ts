import { IModelSelector } from '../types/interfaces/IModelSelector';

/**
 * ModelSelectionService implements IModelSelector for model selection.
 * 
 * This service handles model selection functionality with Supabase integration
 * for persistence and room-specific model settings.
 * 
 * Follows SOLID principles:
 * - Single Responsibility: Only handles model selection
 * - Open/Closed: Extensible for different model providers
 * - Liskov Substitution: Implements IModelSelector interface
 * - Interface Segregation: Focused interface contract
 * - Dependency Inversion: Depends on abstractions
 */
export class ModelSelectionService implements IModelSelector {
  private readonly DEFAULT_MODELS = [
    { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
    { label: 'GPT-4', value: 'gpt-4' }
  ];

  private currentModel = 'gpt-3.5-turbo';
  private roomModels = new Map<number, string>();

  constructor(private supabase: any) {
    console.log('🔍 [ModelSelectionService] Constructor called with supabase:', supabase);
    console.log('🔍 [ModelSelectionService] Supabase type:', typeof supabase);
    console.log('🔍 [ModelSelectionService] Supabase keys:', Object.keys(supabase || {}));
    
    if (!supabase) {
      throw new Error('Supabase client is required');
    }
  }

  /**
   * Get all available models for selection.
   * 
   * @returns Array of model options with label and value properties
   */
  getAvailableModels(): { label: string; value: string }[] {
    // Return a copy to prevent external modification
    return [...this.DEFAULT_MODELS];
  }

  /**
   * Get the currently selected model.
   * 
   * @returns String representing the current model
   */
  getCurrentModel(): string {
    return this.currentModel;
  }

  /**
   * Set the current model.
   * 
   * @param model - The model to set as current
   * @returns Promise that resolves when model is set
   */
  async setModel(model: string): Promise<void> {
    // Validation
    if (!model || typeof model !== 'string') {
      throw new Error('Model must be a non-empty string');
    }

    // Check if model is available
    const availableModels = this.getAvailableModels();
    const isValidModel = availableModels.some(m => m.value === model);
    if (!isValidModel) {
      throw new Error(`Invalid model: ${model}`);
    }

    try {
      // Update current model
      this.currentModel = model;

      // Persist to Supabase if available
      if (this.supabase) {
        await this.supabase
          .from('user_preferences')
          .upsert({
            key: 'current_model',
            value: model,
            updated_at: new Date().toISOString()
          });
      }
    } catch (error) {
      // Revert on error
      this.currentModel = 'gpt-3.5-turbo';
      throw new Error(`Failed to set model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the model for a specific room.
   * 
   * @param roomId - The room ID to get the model for
   * @returns Promise that resolves with the model for the room
   */
  async getModelForRoom(roomId: number): Promise<string> {
    // Validation
    if (!roomId || typeof roomId !== 'number' || roomId <= 0) {
      throw new Error('Room ID must be a positive number');
    }

    try {
      // Check if we have a cached room model
      if (this.roomModels.has(roomId)) {
        return this.roomModels.get(roomId)!;
      }

      // Try to get from Supabase
      if (this.supabase) {
        console.log('🔍 [ModelSelectionService] Attempting to fetch model for room:', roomId);
        console.log('🔍 [ModelSelectionService] Supabase client:', this.supabase);
        console.log('🔍 [ModelSelectionService] Supabase client type:', typeof this.supabase);
        console.log('🔍 [ModelSelectionService] Supabase client keys:', Object.keys(this.supabase || {}));
        
        try {
          const { data, error } = await this.supabase
            .from('chatrooms')
            .select('model')
            .eq('id', roomId)
            .maybeSingle();

          console.log('🔍 [ModelSelectionService] Supabase response:', { data, error });

          if (error) {
            console.error('🔍 [ModelSelectionService] Supabase error:', error);
            // If room doesn't exist or other error, return current model
            return this.currentModel;
          }

          if (data && data.model) {
            // Cache the room model
            this.roomModels.set(roomId, data.model);
            return data.model;
          }
        } catch (supabaseError) {
          console.error('🔍 [ModelSelectionService] Supabase request failed:', supabaseError);
          return this.currentModel;
        }
      }

      // Return current model as fallback
      return this.currentModel;
    } catch (error) {
      // Return current model on error
      return this.currentModel;
    }
  }

  /**
   * Set the model for a specific room.
   * 
   * @param roomId - The room ID to set the model for
   * @param model - The model to set for the room
   * @returns Promise that resolves when room model is set
   */
  async setModelForRoom(roomId: number, model: string): Promise<void> {
    // Validation
    if (!roomId || typeof roomId !== 'number' || roomId <= 0) {
      throw new Error('Room ID must be a positive number');
    }
    if (!model || typeof model !== 'string') {
      throw new Error('Model must be a non-empty string');
    }

    // Check if model is available
    const availableModels = this.getAvailableModels();
    const isValidModel = availableModels.some(m => m.value === model);
    if (!isValidModel) {
      throw new Error(`Invalid model: ${model}`);
    }

    try {
      // Update cache
      this.roomModels.set(roomId, model);

      // Persist to Supabase if available
      if (this.supabase) {
        await this.supabase
          .from('chatrooms')
          .update({ model })
          .eq('id', roomId);
      }
    } catch (error) {
      // Remove from cache on error
      this.roomModels.delete(roomId);
      throw new Error(`Failed to set room model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load user preferences from Supabase.
   * 
   * @returns Promise that resolves when preferences are loaded
   */
  async loadPreferences(): Promise<void> {
    try {
      if (this.supabase) {
        const { data, error } = await this.supabase
          .from('user_preferences')
          .select('key, value')
          .eq('key', 'current_model')
          .single();

        if (!error && data && data.value) {
          this.currentModel = data.value;
        }
      }
    } catch (error) {
      // Ignore errors when loading preferences
      console.warn('Failed to load user preferences:', error);
    }
  }

  /**
   * Clear cached room models.
   * Useful for testing or when cache becomes stale.
   */
  clearCache(): void {
    this.roomModels.clear();
  }

  /**
   * Get the Supabase client.
   * Useful for testing and advanced operations.
   */
  getSupabaseClient(): any {
    return this.supabase;
  }
} 