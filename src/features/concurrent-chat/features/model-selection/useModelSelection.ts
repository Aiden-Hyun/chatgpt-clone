import { useCallback, useEffect, useState } from 'react';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { ModelSelectionService } from '../../services/ModelSelectionService';

/**
 * Hook for managing enhanced model selection
 * Provides model selection functionality using the ModelSelectionService plugin
 */
export function useModelSelection(eventBus: EventBus, serviceContainer: ServiceContainer, roomId?: number) {
  // Model selection service
  const [modelSelectionService] = useState(() => new ModelSelectionService(eventBus, serviceContainer));
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [availableModels, setAvailableModels] = useState<{ label: string; value: string; description?: string }[]>([]);
  const [modelRecommendations, setModelRecommendations] = useState<{ model: string; reason: string; score: number }[]>([]);
  const [modelUsageStats, setModelUsageStats] = useState<Map<string, number>>(new Map());

  // Initialize model selection service
  useEffect(() => {
    const initializeModelSelectionService = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        await modelSelectionService.init();
        setIsInitialized(true);
        
        // Load initial data
        await loadInitialData();
        
      } catch (err) {
        setError(`Failed to initialize model selection service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeModelSelectionService();

    // Cleanup
    return () => {
      modelSelectionService.destroy();
    };
  }, [modelSelectionService]);

  // Load initial data
  const loadInitialData = async () => {
    try {
      // Load current model
      const model = await modelSelectionService.getCurrentModel(roomId);
      setCurrentModel(model);

      // Load available models
      const models = await modelSelectionService.getAvailableModels();
      setAvailableModels(models);

      // Load model recommendations
      const recommendations = modelSelectionService.getModelRecommendations();
      setModelRecommendations(recommendations);

      // Load usage statistics
      const stats = modelSelectionService.getModelUsageStats();
      setModelUsageStats(stats);

    } catch (err) {
      setError(`Failed to load initial data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  /**
   * Change the current model
   */
  const changeModel = useCallback(async (newModel: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Model selection service not initialized');
    }

    try {
      setError(null);
      setIsLoading(true);

      if (roomId) {
        // Set model for specific room
        await modelSelectionService.setModelForRoom(roomId, newModel);
      } else {
        // Set as user preference
        modelSelectionService.setUserPreference('defaultModel', newModel);
      }

      setCurrentModel(newModel);

      // Refresh data
      await loadInitialData();

    } catch (err) {
      const errorMessage = `Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, modelSelectionService, roomId]);

  /**
   * Set model for a specific room
   */
  const setModelForRoom = useCallback(async (roomId: number, model: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Model selection service not initialized');
    }

    try {
      setError(null);
      await modelSelectionService.setModelForRoom(roomId, model);
      
      // Refresh data
      await loadInitialData();

    } catch (err) {
      const errorMessage = `Failed to set model for room: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, modelSelectionService]);

  /**
   * Get model for a specific room
   */
  const getModelForRoom = useCallback(async (roomId: number): Promise<string> => {
    if (!isInitialized) {
      throw new Error('Model selection service not initialized');
    }

    try {
      return await modelSelectionService.getModelForRoom(roomId);
    } catch (err) {
      const errorMessage = `Failed to get model for room: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, modelSelectionService]);

  /**
   * Set user preference
   */
  const setUserPreference = useCallback((key: string, value: any): void => {
    if (!isInitialized) {
      throw new Error('Model selection service not initialized');
    }

    try {
      modelSelectionService.setUserPreference(key, value);
    } catch (err) {
      const errorMessage = `Failed to set user preference: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, modelSelectionService]);

  /**
   * Get user preference
   */
  const getUserPreference = useCallback((key: string): any => {
    return modelSelectionService.getUserPreference(key);
  }, [modelSelectionService]);

  /**
   * Get model recommendations
   */
  const getModelRecommendations = useCallback(() => {
    return modelSelectionService.getModelRecommendations();
  }, [modelSelectionService]);

  /**
   * Get most used model
   */
  const getMostUsedModel = useCallback(() => {
    return modelSelectionService.getMostUsedModel();
  }, [modelSelectionService]);

  /**
   * Check if model is available
   */
  const isModelAvailable = useCallback((model: string): boolean => {
    return availableModels.some(m => m.value === model);
  }, [availableModels]);

  /**
   * Get model description
   */
  const getModelDescription = useCallback((model: string): string => {
    const modelInfo = availableModels.find(m => m.value === model);
    return modelInfo?.description || 'AI language model';
  }, [availableModels]);

  /**
   * Get model usage count
   */
  const getModelUsageCount = useCallback((model: string): number => {
    return modelUsageStats.get(model) || 0;
  }, [modelUsageStats]);

  /**
   * Get model selection statistics
   */
  const getModelSelectionStats = useCallback(() => {
    return modelSelectionService.getModelSelectionStats();
  }, [modelSelectionService]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Model selection service not initialized');
    }

    try {
      setError(null);
      await loadInitialData();
    } catch (err) {
      const errorMessage = `Failed to refresh data: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    currentModel,
    availableModels,
    modelRecommendations,
    modelUsageStats: Array.from(modelUsageStats.entries()),
    
    // Actions
    changeModel,
    setModelForRoom,
    setUserPreference,
    refreshData,
    
    // Queries
    getModelForRoom,
    getUserPreference,
    getModelRecommendations,
    getMostUsedModel,
    isModelAvailable,
    getModelDescription,
    getModelUsageCount,
    getModelSelectionStats,
    
    // Service reference
    modelSelectionService,
  };
} 