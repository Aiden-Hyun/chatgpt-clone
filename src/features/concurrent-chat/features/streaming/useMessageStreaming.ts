import { useCallback, useEffect, useState } from 'react';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { StreamingService } from './StreamingService';

/**
 * Hook for managing message streaming
 * Provides streaming functionality for messages using the StreamingService
 */
export function useMessageStreaming(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Streaming service
  const [streamingService] = useState(() => new StreamingService(eventBus, serviceContainer));
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStreams, setActiveStreams] = useState<Set<string>>(new Set());
  const [chunkBufferSize, setChunkBufferSize] = useState<number>(10);
  const [chunkDelay, setChunkDelay] = useState<number>(50);

  // Initialize streaming service
  useEffect(() => {
    const initializeStreamingService = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        await streamingService.init();
        setIsInitialized(true);
        
        // Update state with initial values
        setChunkBufferSize(streamingService.getChunkBufferSize());
        setChunkDelay(streamingService.getChunkDelay());
        
      } catch (err) {
        setError(`Failed to initialize streaming service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStreamingService();

    // Cleanup
    return () => {
      streamingService.destroy();
    };
  }, [streamingService]);

  // Update active streams periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateActiveStreams = () => {
      const activeIds = new Set<string>();
      // This is a simplified check - in a real implementation you'd track actual active streams
      if (streamingService.getActiveStreamCount() > 0) {
        // Add some mock active streams for demonstration
        activeIds.add(`stream-${Date.now()}`);
      }
      setActiveStreams(activeIds);
    };

    const interval = setInterval(updateActiveStreams, 1000);
    return () => clearInterval(interval);
  }, [isInitialized, streamingService]);

  /**
   * Start streaming a message
   */
  const startStreaming = useCallback(async (
    messageId: string,
    request: any,
    onChunk: (chunk: string) => void,
    onComplete: (content: string) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    try {
      setError(null);
      await streamingService.startStreaming(messageId, request, onChunk, onComplete, onError);
    } catch (err) {
      const errorMessage = `Failed to start streaming: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, streamingService]);

  /**
   * Stop streaming for a specific message
   */
  const stopStreaming = useCallback(async (messageId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    try {
      await streamingService.stopStreaming(messageId);
    } catch (err) {
      const errorMessage = `Failed to stop streaming: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, streamingService]);

  /**
   * Stop all active streams
   */
  const stopAllStreams = useCallback(async (): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    try {
      await streamingService.stopAllStreams();
    } catch (err) {
      const errorMessage = `Failed to stop all streams: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, streamingService]);

  /**
   * Check if a message is currently being streamed
   */
  const isStreaming = useCallback((messageId: string): boolean => {
    return streamingService.isStreaming(messageId);
  }, [streamingService]);

  /**
   * Get streaming statistics for a message
   */
  const getStreamStats = useCallback((messageId: string) => {
    return streamingService.getStreamStats(messageId);
  }, [streamingService]);

  /**
   * Get streaming service statistics
   */
  const getStreamingStats = useCallback(() => {
    return streamingService.getStreamingStats();
  }, [streamingService]);

  /**
   * Set the chunk buffer size
   */
  const updateChunkBufferSize = useCallback((size: number): void => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    streamingService.setChunkBufferSize(size);
    setChunkBufferSize(size);
  }, [isInitialized, streamingService]);

  /**
   * Get the chunk buffer size
   */
  const getChunkBufferSize = useCallback((): number => {
    return streamingService.getChunkBufferSize();
  }, [streamingService]);

  /**
   * Set the chunk delay in milliseconds
   */
  const updateChunkDelay = useCallback((delay: number): void => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    streamingService.setChunkDelay(delay);
    setChunkDelay(delay);
  }, [isInitialized, streamingService]);

  /**
   * Get the chunk delay in milliseconds
   */
  const getChunkDelay = useCallback((): number => {
    return streamingService.getChunkDelay();
  }, [streamingService]);

  /**
   * Get the number of active streams
   */
  const getActiveStreamCount = useCallback((): number => {
    return streamingService.getActiveStreamCount();
  }, [streamingService]);

  /**
   * Get streaming progress for a message
   */
  const getStreamingProgress = useCallback((messageId: string): number => {
    return streamingService.getStreamingProgress(messageId);
  }, [streamingService]);

  /**
   * Get streaming text for a message
   */
  const getStreamingText = useCallback((messageId: string): string => {
    return streamingService.getStreamingText(messageId);
  }, [streamingService]);

  /**
   * Pause streaming for a message
   */
  const pauseStreaming = useCallback(async (messageId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    try {
      setError(null);
      await streamingService.pauseStreaming(messageId);
    } catch (err) {
      const errorMessage = `Failed to pause streaming: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, streamingService]);

  /**
   * Resume streaming for a message
   */
  const resumeStreaming = useCallback(async (messageId: string): Promise<void> => {
    if (!isInitialized) {
      throw new Error('Streaming service not initialized');
    }

    try {
      setError(null);
      await streamingService.resumeStreaming(messageId);
    } catch (err) {
      const errorMessage = `Failed to resume streaming: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, streamingService]);

  /**
   * Get the number of active streaming sessions
   */
  const getActiveStreamingCount = useCallback((): number => {
    return streamingService.getActiveStreamingCount();
  }, [streamingService]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    activeStreams: Array.from(activeStreams),
    chunkBufferSize,
    chunkDelay,
    
    // Actions
    startStreaming,
    stopStreaming,
    pauseStreaming,
    resumeStreaming,
    stopAllStreams,
    setChunkBufferSize,
    setChunkDelay,
    
    // Queries
    isStreaming,
    getStreamingProgress,
    getStreamingText,
    getStreamStats,
    getStreamingStats,
    getChunkBufferSize,
    getChunkDelay,
    getActiveStreamCount,
    getActiveStreamingCount,
    
    // Service reference
    streamingService,
  };
} 