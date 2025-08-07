import { useCallback, useEffect, useRef, useState } from 'react';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { IAnimationStrategy } from '../../core/types/interfaces/IAnimationStrategy';
import { AnimationService } from './AnimationService';

/**
 * Hook for managing message animations
 * Provides animation functionality for messages using the AnimationService
 */
export function useMessageAnimation(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Animation service
  const [animationService] = useState(() => new AnimationService(eventBus, serviceContainer));
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeAnimations, setActiveAnimations] = useState<Set<string>>(new Set());
  const [availableStrategies, setAvailableStrategies] = useState<string[]>([]);
  const [defaultStrategy, setDefaultStrategy] = useState<string>('typewriter');
  
  // Refs
  const animationElementsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Initialize animation service
  useEffect(() => {
    const initializeAnimationService = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        await animationService.init();
        setIsInitialized(true);
        
        // Update state with initial values
        setAvailableStrategies(animationService.getAvailableStrategies());
        setDefaultStrategy(animationService.getDefaultStrategy());
        
      } catch (err) {
        setError(`Failed to initialize animation service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAnimationService();

    // Cleanup
    return () => {
      animationService.destroy();
    };
  }, [animationService]);

  // Update active animations periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateActiveAnimations = () => {
      const activeIds = new Set<string>();
      availableStrategies.forEach(strategy => {
        // This is a simplified check - in a real implementation you'd track actual active animations
        if (animationService.getActiveAnimationCount() > 0) {
          // Add some mock active animations for demonstration
          activeIds.add(`animation-${strategy}-${Date.now()}`);
        }
      });
      setActiveAnimations(activeIds);
    };

    const interval = setInterval(updateActiveAnimations, 1000);
    return () => clearInterval(interval);
  }, [isInitialized, availableStrategies, animationService]);

  /**
   * Register an animation element for a message
   */
  const registerAnimationElement = useCallback((messageId: string, element: HTMLElement) => {
    animationElementsRef.current.set(messageId, element);
  }, []);

  /**
   * Unregister an animation element
   */
  const unregisterAnimationElement = useCallback((messageId: string) => {
    animationElementsRef.current.delete(messageId);
  }, []);

  /**
   * Animate a message with the specified strategy
   */
  const animateMessage = useCallback(async (
    messageId: string,
    content: string,
    strategyName?: string
  ): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Animation service not initialized');
    }

    const element = animationElementsRef.current.get(messageId);
    if (!element) {
      throw new Error(`No animation element registered for message: ${messageId}`);
    }

    try {
      setError(null);
      await animationService.animateMessage(messageId, content, element, strategyName);
    } catch (err) {
      const errorMessage = `Failed to animate message: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, animationService]);

  /**
   * Cancel animation for a specific message
   */
  const cancelAnimation = useCallback(async (messageId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Animation service not initialized');
    }

    try {
      await animationService.cancelAnimation(messageId);
    } catch (err) {
      const errorMessage = `Failed to cancel animation: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, animationService]);

  /**
   * Cancel all active animations
   */
  const cancelAllAnimations = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Animation service not initialized');
    }

    try {
      await animationService.cancelAllAnimations();
    } catch (err) {
      const errorMessage = `Failed to cancel all animations: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, animationService]);

  /**
   * Check if a message is currently being animated
   */
  const isAnimating = useCallback((messageId: string): boolean => {
    return animationService.isAnimating(messageId);
  }, [animationService]);

  /**
   * Get animation statistics
   */
  const getAnimationStats = useCallback(() => {
    return animationService.getAnimationStats();
  }, [animationService]);

  /**
   * Register a custom animation strategy
   */
  const registerStrategy = useCallback((name: string, strategy: IAnimationStrategy): void => {
    if (!isInitialized) {
      throw new Error('Animation service not initialized');
    }

    animationService.registerStrategy(name, strategy);
    setAvailableStrategies(animationService.getAvailableStrategies());
  }, [isInitialized, animationService]);

  /**
   * Set the default animation strategy
   */
  const updateDefaultAnimationStrategy = useCallback((name: string): void => {
    if (!isInitialized) {
      throw new Error('Animation service not initialized');
    }

    animationService.setDefaultStrategy(name);
    setDefaultStrategy(name);
  }, [isInitialized, animationService]);

  /**
   * Get an animation strategy by name
   */
  const getStrategy = useCallback((name: string): IAnimationStrategy | undefined => {
    return animationService.getStrategy(name);
  }, [animationService]);

  /**
   * Get the number of active animations
   */
  const getActiveAnimationCount = useCallback((): number => {
    return animationService.getActiveAnimationCount();
  }, [animationService]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    activeAnimations: Array.from(activeAnimations),
    availableStrategies,
    defaultStrategy,
    
    // Actions
    registerAnimationElement,
    unregisterAnimationElement,
    animateMessage,
    cancelAnimation,
    cancelAllAnimations,
    registerStrategy,
    setDefaultAnimationStrategy: updateDefaultAnimationStrategy,
    
    // Queries
    isAnimating,
    getAnimationStats,
    getStrategy,
    getActiveAnimationCount,
    
    // Service reference
    animationService,
  };
} 