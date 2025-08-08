import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { MessageEvent } from '../../core/types/events/MessageEvents';
import { IModelSelector } from '../../core/types/interfaces/IModelSelector';
// Plugin base removed; convert to plain service while keeping API

/**
 * Model Selection Service Plugin
 * Provides enhanced model selection functionality with room-specific settings
 */
export class ModelSelectionService {
  private readonly eventBus: EventBus;
  private readonly container: ServiceContainer;
  private subscriptions: string[] = [];
  private roomModelSettings = new Map<number, string>();
  private userPreferences = new Map<string, any>();
  private modelUsageStats = new Map<string, number>();

  constructor(eventBus: EventBus, container: ServiceContainer) {
    this.eventBus = eventBus;
    this.container = container;
  }

  async init(): Promise<void> {
    try {
      this.log('Initializing Model Selection Service');
      
      // Set up event subscriptions
      this.setupEventSubscriptions();
      
      // Load user preferences and room settings
      await this.loadSettings();
      
      this.log('Model Selection Service initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize Model Selection Service: ${error}`, 'error');
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.log('Destroying Model Selection Service');
      
      // Save settings before destroying
      await this.saveSettings();
      
      // Clean up event subscriptions
      this.cleanupSubscriptions();
      
      this.log('Model Selection Service destroyed successfully');
    } catch (error) {
      this.log(`Failed to destroy Model Selection Service: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Set model for a specific room
   */
  async setModelForRoom(roomId: number, model: string): Promise<void> {
    try {
      this.log(`Setting model for room ${roomId} to: ${model}`);

      // Validate model
      const availableModels = await this.getAvailableModels();
      const isValidModel = availableModels.some(m => m.value === model);
      
      if (!isValidModel) {
        throw new Error(`Invalid model: ${model}`);
      }

      // Update room model setting
      this.roomModelSettings.set(roomId, model);

      // Update usage statistics
      this.updateModelUsageStats(model);

      // Publish model changed event
      this.publishEvent({
        type: 'MODEL_CHANGED',
        timestamp: Date.now(),
        roomId,
        oldModel: this.roomModelSettings.get(roomId) || 'unknown',
        newModel: model,
      });

      this.log(`Successfully set model for room ${roomId} to: ${model}`);

    } catch (error) {
      this.log(`Failed to set model for room ${roomId}: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Get model for a specific room
   */
  async getModelForRoom(roomId: number): Promise<string> {
    // Check room-specific setting first
    if (this.roomModelSettings.has(roomId)) {
      return this.roomModelSettings.get(roomId)!;
    }

    // Fall back to user preference
    const userPreference = this.userPreferences.get('defaultModel');
    if (userPreference) {
      return userPreference;
    }

    // Fall back to default
    return 'gpt-3.5-turbo';
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<Array<{ label: string; value: string; description?: string }>> {
    try {
      // Get the core model selector from the service container
      const modelSelector = this.container.get<IModelSelector>('modelSelector');
      const baseModels = modelSelector.getAvailableModels();

      // Enhance with additional metadata
      const enhancedModels = baseModels.map(model => ({
        ...model,
        description: this.getModelDescription(model.value),
        usageCount: this.modelUsageStats.get(model.value) || 0,
      }));

      return enhancedModels;

    } catch (error) {
      this.log(`Failed to get available models: ${error}`, 'error');
      
      // Return default models if service is not available
      return [
        { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo', description: 'Fast and efficient' },
        { label: 'GPT-4', value: 'gpt-4', description: 'Most capable model' },
        { label: 'Claude-3', value: 'claude-3', description: 'Anthropic\'s latest model' },
      ];
    }
  }

  /**
   * Get current model
   */
  async getCurrentModel(roomId?: number): Promise<string> {
    if (roomId) {
      return await this.getModelForRoom(roomId);
    }

    // Return user preference or default
    return this.userPreferences.get('defaultModel') || 'gpt-3.5-turbo';
  }

  /**
   * Set user preference for default model
   */
  setUserPreference(key: string, value: any): void {
    this.userPreferences.set(key, value);
    this.log(`Set user preference: ${key} = ${value}`);
  }

  /**
   * Get user preference
   */
  getUserPreference(key: string): any {
    return this.userPreferences.get(key);
  }

  /**
   * Get model usage statistics
   */
  getModelUsageStats(): Map<string, number> {
    return new Map(this.modelUsageStats);
  }

  /**
   * Get most used model
   */
  getMostUsedModel(): string | null {
    if (this.modelUsageStats.size === 0) {
      return null;
    }

    let mostUsedModel = '';
    let maxUsage = 0;

    for (const [model, usage] of this.modelUsageStats) {
      if (usage > maxUsage) {
        maxUsage = usage;
        mostUsedModel = model;
      }
    }

    return mostUsedModel;
  }

  /**
   * Get model recommendations based on usage patterns
   */
  getModelRecommendations(): Array<{ model: string; reason: string; score: number }> {
    const recommendations: Array<{ model: string; reason: string; score: number }> = [];
    const mostUsed = this.getMostUsedModel();

    if (mostUsed) {
      recommendations.push({
        model: mostUsed,
        reason: 'Most frequently used',
        score: 0.9,
      });
    }

    // Add default recommendations
    recommendations.push({
      model: 'gpt-3.5-turbo',
      reason: 'Fast and cost-effective',
      score: 0.8,
    });

    recommendations.push({
      model: 'gpt-4',
      reason: 'Most capable for complex tasks',
      score: 0.7,
    });

    return recommendations.sort((a, b) => b.score - a.score);
  }

  /**
   * Get model selection service statistics
   */
  getModelSelectionStats(): {
    totalRooms: number;
    totalUserPreferences: number;
    totalModelUsage: number;
    mostUsedModel: string | null;
  } {
    return {
      totalRooms: this.roomModelSettings.size,
      totalUserPreferences: this.userPreferences.size,
      totalModelUsage: Array.from(this.modelUsageStats.values()).reduce((sum, count) => sum + count, 0),
      mostUsedModel: this.getMostUsedModel(),
    };
  }

  private updateModelUsageStats(model: string): void {
    const currentCount = this.modelUsageStats.get(model) || 0;
    this.modelUsageStats.set(model, currentCount + 1);
  }

  private getModelDescription(model: string): string {
    const descriptions: Record<string, string> = {
      'gpt-3.5-turbo': 'Fast and efficient model for most tasks',
      'gpt-4': 'Most capable model for complex reasoning',
      'claude-3': 'Anthropic\'s latest model with strong reasoning',
      'gpt-4-turbo': 'Enhanced version of GPT-4 with better performance',
    };

    return descriptions[model] || 'AI language model';
  }

  private async loadSettings(): Promise<void> {
    try {
      // In a real implementation, you'd load from persistent storage
      // For now, we'll use default values
      this.log('Loading model selection settings');
      
      // Load room settings (would come from database)
      // this.roomModelSettings = await loadRoomSettings();
      
      // Load user preferences (would come from localStorage or database)
      // this.userPreferences = await loadUserPreferences();
      
      // Load usage statistics (would come from analytics)
      // this.modelUsageStats = await loadUsageStats();
      
    } catch (error) {
      this.log(`Failed to load settings: ${error}`, 'warn');
      // Continue with default values
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      this.log('Saving model selection settings');
      
      // In a real implementation, you'd save to persistent storage
      // await saveRoomSettings(this.roomModelSettings);
      // await saveUserPreferences(this.userPreferences);
      // await saveUsageStats(this.modelUsageStats);
      
    } catch (error) {
      this.log(`Failed to save settings: ${error}`, 'error');
    }
  }

  private setupEventSubscriptions(): void {
    // Subscribe to model-related events
    this.subscribeToEvent('MODEL_CHANGED', async (event: MessageEvent) => {
      if (event.type === 'MODEL_CHANGED') {
        this.log(`Model changed event received: ${event.newModel} for room ${event.roomId}`);
        
        // Update usage statistics
        this.updateModelUsageStats(event.newModel);
      }
    });

    this.subscribeToEvent('MESSAGE_SENT', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_SENT') {
        // Track model usage when messages are sent
        if (event.model) {
          this.updateModelUsageStats(event.model);
        }
      }
    });
  }

  // --- Helpers to replace BasePlugin functionality ---
  private publishEvent(event: MessageEvent): void {
    this.eventBus.publish(event.type, event);
  }

  private subscribeToEvent(eventType: string, handler: (event: MessageEvent) => void | Promise<void>): void {
    const id = this.eventBus.subscribe(eventType, handler);
    this.subscriptions.push(id);
  }

  private cleanupSubscriptions(): void {
    this.subscriptions.forEach(id => this.eventBus.unsubscribeById(id));
    this.subscriptions = [];
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const ts = new Date().toISOString();
    const prefix = `[model-selection-service]`;
    if (level === 'error') console.error(ts, prefix, message);
    else if (level === 'warn') console.warn(ts, prefix, message);
    else console.log(ts, prefix, message);
  }
} 