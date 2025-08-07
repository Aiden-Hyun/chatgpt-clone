import { useCallback, useEffect, useState } from 'react';
import { ServiceContainer } from '../container/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { MESSAGE_EVENT_TYPES, MessageEvent } from '../types/events/MessageEvents';
import { IModelSelector } from '../types/interfaces/IModelSelector';

/**
 * Hook for managing model selection in the concurrent chat system
 * Handles model switching, persistence, and room-specific model settings
 */
export function useModelSelection(eventBus: EventBus, serviceContainer: ServiceContainer, roomId?: number) {
  // Model state
  const [currentModel, setCurrentModel] = useState<string>('gpt-3.5-turbo');
  const [availableModels, setAvailableModels] = useState<Array<{ label: string; value: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Model selector service
  const [modelSelector, setModelSelector] = useState<IModelSelector | null>(null);

  // Initialize model selector
  useEffect(() => {
    const initializeModelSelector = async () => {
      try {
        setError(null);
        
        // Get model selector from service container
        const selector = serviceContainer.get<IModelSelector>('modelSelector');
        setModelSelector(selector);
        
        // Load available models
        const models = selector.getAvailableModels();
        setAvailableModels(models);
        
        // Load current model for room
        if (roomId) {
          const model = await selector.getModelForRoom(roomId);
          setCurrentModel(model);
        } else {
          const defaultModel = selector.getCurrentModel();
          setCurrentModel(defaultModel);
        }
        
      } catch (err) {
        setError(`Failed to initialize model selector: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initializeModelSelector();
  }, [serviceContainer, roomId]);

  // Set up event subscriptions
  useEffect(() => {
    if (!eventBus) return;

    const subscriptionId = eventBus.subscribe(MESSAGE_EVENT_TYPES.MODEL_CHANGED, (event: MessageEvent) => {
      if (event.type === MESSAGE_EVENT_TYPES.MODEL_CHANGED) {
        setCurrentModel(event.newModel);
      }
    });

    return () => {
      eventBus.unsubscribeById(subscriptionId);
    };
  }, [eventBus]);

  /**
   * Change the current model
   * @param newModel The new model to switch to
   */
  const changeModel = useCallback(async (newModel: string) => {
    if (!modelSelector) {
      throw new Error('Model selector not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const oldModel = currentModel;
      
      // Change the model
      await modelSelector.setModel(newModel);
      setCurrentModel(newModel);
      
      // Publish model changed event
      eventBus.publish(MESSAGE_EVENT_TYPES.MODEL_CHANGED, {
        type: MESSAGE_EVENT_TYPES.MODEL_CHANGED,
        timestamp: Date.now(),
        oldModel,
        newModel,
        roomId,
      });
      
    } catch (err) {
      setError(`Failed to change model: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [modelSelector, currentModel, eventBus, roomId]);

  /**
   * Get the current model
   * @returns The current model identifier
   */
  const getCurrentModel = useCallback(() => {
    return currentModel;
  }, [currentModel]);

  /**
   * Get available models
   * @returns Array of available model options
   */
  const getAvailableModels = useCallback(() => {
    return availableModels;
  }, [availableModels]);

  /**
   * Check if a model is available
   * @param model The model to check
   * @returns True if the model is available
   */
  const isModelAvailable = useCallback((model: string) => {
    return availableModels.some(m => m.value === model);
  }, [availableModels]);

  /**
   * Get model for a specific room
   * @param roomId The room ID
   * @returns Promise that resolves to the model for the room
   */
  const getModelForRoom = useCallback(async (roomId: number) => {
    if (!modelSelector) {
      throw new Error('Model selector not initialized');
    }

    try {
      return await modelSelector.getModelForRoom(roomId);
    } catch (err) {
      setError(`Failed to get model for room: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [modelSelector]);

  /**
   * Set model for a specific room
   * @param roomId The room ID
   * @param model The model to set
   */
  const setModelForRoom = useCallback(async (roomId: number, model: string) => {
    if (!modelSelector) {
      throw new Error('Model selector not initialized');
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Set model for room (this would be implemented in the model selector)
      // For now, we'll just change the current model
      await changeModel(model);
      
    } catch (err) {
      setError(`Failed to set model for room: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [modelSelector, changeModel]);

  /**
   * Refresh available models
   */
  const refreshAvailableModels = useCallback(() => {
    if (!modelSelector) {
      setError('Model selector not initialized');
      return;
    }

    try {
      const models = modelSelector.getAvailableModels();
      setAvailableModels(models);
    } catch (err) {
      setError(`Failed to refresh available models: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [modelSelector]);

  /**
   * Get model information
   * @param model The model identifier
   * @returns Model information object
   */
  const getModelInfo = useCallback((model: string) => {
    const modelOption = availableModels.find(m => m.value === model);
    return modelOption ? {
      ...modelOption,
      isCurrent: model === currentModel,
      isAvailable: true,
    } : {
      label: model,
      value: model,
      isCurrent: model === currentModel,
      isAvailable: false,
    };
  }, [availableModels, currentModel]);

  /**
   * Get current model information
   * @returns Current model information object
   */
  const getCurrentModelInfo = useCallback(() => {
    return getModelInfo(currentModel);
  }, [getModelInfo, currentModel]);

  /**
   * Check if model is currently selected
   * @param model The model to check
   * @returns True if the model is currently selected
   */
  const isCurrentModel = useCallback((model: string) => {
    return model === currentModel;
  }, [currentModel]);

  return {
    // State
    currentModel,
    availableModels,
    isLoading,
    error,
    
    // Actions
    changeModel,
    setModelForRoom,
    refreshAvailableModels,
    
    // Queries
    getCurrentModel,
    getAvailableModels,
    isModelAvailable,
    getModelForRoom,
    getModelInfo,
    getCurrentModelInfo,
    isCurrentModel,
    
    // Model selector (for advanced usage)
    modelSelector,
  };
} 