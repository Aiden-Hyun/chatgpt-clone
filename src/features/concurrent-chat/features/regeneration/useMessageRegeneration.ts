import { useCallback, useEffect, useState } from 'react';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { ConcurrentMessage } from '../../core/types/interfaces/IMessageProcessor';
import { RegenerationService } from './RegenerationService';

/**
 * Hook for managing message regeneration
 * Provides regeneration functionality for messages using the RegenerationService
 */
export function useMessageRegeneration(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Regeneration service
  const [regenerationService] = useState(() => new RegenerationService(eventBus, serviceContainer));
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRegenerations, setPendingRegenerations] = useState<Set<string>>(new Set());
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [retryDelay, setRetryDelay] = useState<number>(1000);

  // Initialize regeneration service
  useEffect(() => {
    const initializeRegenerationService = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        await regenerationService.init();
        setIsInitialized(true);
        
        // Update state with initial values
        setMaxRetries(regenerationService.getMaxRetries());
        setRetryDelay(regenerationService.getRetryDelay());
        
      } catch (err) {
        setError(`Failed to initialize regeneration service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeRegenerationService();

    // Cleanup
    return () => {
      regenerationService.destroy();
    };
  }, [regenerationService]);

  // Update pending regenerations periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updatePendingRegenerations = () => {
      const pendingIds = new Set<string>();
      // This is a simplified check - in a real implementation you'd track actual pending regenerations
      if (regenerationService.getPendingRegenerationCount() > 0) {
        // Add some mock pending regenerations for demonstration
        pendingIds.add(`regeneration-${Date.now()}`);
      }
      setPendingRegenerations(pendingIds);
    };

    const interval = setInterval(updatePendingRegenerations, 1000);
    return () => clearInterval(interval);
  }, [isInitialized, regenerationService]);

  /**
   * Regenerate a message
   */
  const regenerateMessage = useCallback(async (
    messageId: string,
    context: ConcurrentMessage[],
    model?: string
  ): Promise<ConcurrentMessage> => {
    if (!isInitialized) {
      throw new Error('Regeneration service not initialized');
    }

    try {
      setError(null);
      const regeneratedMessage = await regenerationService.regenerateMessage(messageId, context, model);
      return regeneratedMessage;
    } catch (err) {
      const errorMessage = `Failed to regenerate message: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, regenerationService]);

  /**
   * Cancel regeneration for a specific message
   */
  const cancelRegeneration = useCallback(async (messageId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Regeneration service not initialized');
    }

    try {
      await regenerationService.cancelRegeneration(messageId);
    } catch (err) {
      const errorMessage = `Failed to cancel regeneration: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, regenerationService]);

  /**
   * Cancel all pending regenerations
   */
  const cancelAllRegenerations = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Regeneration service not initialized');
    }

    try {
      await regenerationService.cancelAllRegenerations();
    } catch (err) {
      const errorMessage = `Failed to cancel all regenerations: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, regenerationService]);

  /**
   * Check if a message is currently being regenerated
   */
  const isRegenerating = useCallback((messageId: string): boolean => {
    return regenerationService.isRegenerating(messageId);
  }, [regenerationService]);

  /**
   * Get regeneration statistics
   */
  const getRegenerationStats = useCallback(() => {
    return regenerationService.getRegenerationStats();
  }, [regenerationService]);

  /**
   * Set the maximum number of retries for regeneration
   */
  const updateMaxRetries = useCallback((maxRetries: number): void => {
    if (!isInitialized) {
      throw new Error('Regeneration service not initialized');
    }

    regenerationService.setMaxRetries(maxRetries);
    setMaxRetries(maxRetries);
  }, [isInitialized, regenerationService]);

  /**
   * Get the maximum number of retries
   */
  const getMaxRetries = useCallback((): number => {
    return regenerationService.getMaxRetries();
  }, [regenerationService]);

  /**
   * Set the retry delay in milliseconds
   */
  const updateRetryDelay = useCallback((delay: number): void => {
    if (!isInitialized) {
      throw new Error('Regeneration service not initialized');
    }

    regenerationService.setRetryDelay(delay);
    setRetryDelay(delay);
  }, [isInitialized, regenerationService]);

  /**
   * Get the retry delay in milliseconds
   */
  const getRetryDelay = useCallback((): number => {
    return regenerationService.getRetryDelay();
  }, [regenerationService]);

  /**
   * Get the number of pending regenerations
   */
  const getPendingRegenerationCount = useCallback((): number => {
    return regenerationService.getPendingRegenerationCount();
  }, [regenerationService]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    pendingRegenerations: Array.from(pendingRegenerations),
    maxRetries,
    retryDelay,
    
    // Actions
    regenerateMessage,
    cancelRegeneration,
    cancelAllRegenerations,
    updateMaxRetries,
    updateRetryDelay,
    
    // Queries
    isRegenerating,
    getRegenerationStats,
    getMaxRetries,
    getRetryDelay,
    getPendingRegenerationCount,
    
    // Service reference
    regenerationService,
  };
} 