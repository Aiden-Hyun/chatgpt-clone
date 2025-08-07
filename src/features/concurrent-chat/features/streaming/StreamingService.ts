import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { MessageEvent } from '../../core/types/events/MessageEvents';
import { IAIService } from '../../core/types/interfaces/IAIService';
import { BasePlugin } from '../../plugins/BasePlugin';

/**
 * Streaming Service Plugin
 * Handles message streaming and provides streaming functionality
 */
export class StreamingService extends BasePlugin {
  private activeStreams = new Map<string, {
    messageId: string;
    content: string;
    isActive: boolean;
    startTime: number;
    chunkCount: number;
    onChunk: (chunk: string) => void;
    onComplete: (content: string) => void;
    onError: (error: string) => void;
  }>();
  private chunkBufferSize: number = 10;
  private chunkDelay: number = 50; // 50ms between chunks

  constructor(eventBus: EventBus, container: ServiceContainer) {
    super('streaming-service', 'Streaming Service', '1.0.0', eventBus, container);
  }

  async init(): Promise<void> {
    try {
      this.log('Initializing Streaming Service');
      
      // Set up event subscriptions
      this.setupEventSubscriptions();
      
      this.log('Streaming Service initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize Streaming Service: ${error}`, 'error');
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.log('Destroying Streaming Service');
      
      // Stop all active streams
      await this.stopAllStreams();
      
      // Clean up event subscriptions
      this.cleanupSubscriptions();
      
      this.log('Streaming Service destroyed successfully');
    } catch (error) {
      this.log(`Failed to destroy Streaming Service: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Start streaming a message
   */
  async startStreaming(
    messageId: string,
    request: any,
    onChunk: (chunk: string) => void,
    onComplete: (content: string) => void,
    onError: (error: string) => void
  ): Promise<void> {
    if (this.activeStreams.has(messageId)) {
      throw new Error(`Streaming already in progress for message: ${messageId}`);
    }

    try {
      this.log(`Starting streaming for message: ${messageId}`);

      // Publish streaming started event
      this.publishEvent({
        type: 'STREAMING_STARTED',
        timestamp: Date.now(),
        messageId,
      });

      // Get AI service from container
      const aiService = this.container.get<IAIService>('aiService');

      // Create stream session
      const streamSession = {
        messageId,
        content: '',
        isActive: true,
        startTime: Date.now(),
        chunkCount: 0,
        onChunk,
        onComplete,
        onError,
      };

      this.activeStreams.set(messageId, streamSession);

      // Start streaming
      await this.performStreaming(messageId, request, aiService, streamSession);

    } catch (error) {
      this.log(`Failed to start streaming for message ${messageId}: ${error}`, 'error');
      
      // Publish streaming failed event
      this.publishEvent({
        type: 'STREAMING_FAILED',
        timestamp: Date.now(),
        messageId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    }
  }

  /**
   * Stop streaming for a specific message
   */
  async stopStreaming(messageId: string): Promise<void> {
    const stream = this.activeStreams.get(messageId);
    if (!stream) {
      return; // No active stream
    }

    stream.isActive = false;
    this.activeStreams.delete(messageId);

    this.log(`Stopped streaming for message: ${messageId}`);

    // Publish streaming stopped event
    this.publishEvent({
      type: 'STREAMING_STOPPED',
      timestamp: Date.now(),
      messageId,
      finalContent: stream.content,
      chunkCount: stream.chunkCount,
    });
  }

  /**
   * Stop all active streams
   */
  async stopAllStreams(): Promise<void> {
    const messageIds = Array.from(this.activeStreams.keys());
    await Promise.all(messageIds.map(id => this.stopStreaming(id)));
    this.log(`Stopped all streams (${messageIds.length} total)`);
  }

  /**
   * Check if a message is currently being streamed
   */
  isStreaming(messageId: string): boolean {
    return this.activeStreams.has(messageId);
  }

  /**
   * Get the number of active streams
   */
  getActiveStreamCount(): number {
    return this.activeStreams.size;
  }

  /**
   * Get streaming statistics for a message
   */
  getStreamStats(messageId: string): {
    isActive: boolean;
    content: string;
    chunkCount: number;
    duration: number;
  } | undefined {
    const stream = this.activeStreams.get(messageId);
    if (!stream) {
      return undefined;
    }

    return {
      isActive: stream.isActive,
      content: stream.content,
      chunkCount: stream.chunkCount,
      duration: Date.now() - stream.startTime,
    };
  }

  /**
   * Set the chunk buffer size
   */
  setChunkBufferSize(size: number): void {
    this.chunkBufferSize = Math.max(1, size);
    this.log(`Set chunk buffer size to: ${this.chunkBufferSize}`);
  }

  /**
   * Get the chunk buffer size
   */
  getChunkBufferSize(): number {
    return this.chunkBufferSize;
  }

  /**
   * Set the chunk delay in milliseconds
   */
  setChunkDelay(delay: number): void {
    this.chunkDelay = Math.max(0, delay);
    this.log(`Set chunk delay to: ${this.chunkDelay}ms`);
  }

  /**
   * Get the chunk delay in milliseconds
   */
  getChunkDelay(): number {
    return this.chunkDelay;
  }

  /**
   * Get streaming service statistics
   */
  getStreamingStats(): {
    activeStreams: number;
    chunkBufferSize: number;
    chunkDelay: number;
    totalStreams: number;
  } {
    return {
      activeStreams: this.activeStreams.size,
      chunkBufferSize: this.chunkBufferSize,
      chunkDelay: this.chunkDelay,
      totalStreams: this.activeStreams.size,
    };
  }

  /**
   * Get streaming progress for a message
   */
  getStreamingProgress(messageId: string): number {
    const stream = this.activeStreams.get(messageId);
    if (!stream) return 0;
    
    // Calculate progress based on content length (simplified)
    return Math.min(stream.content.length / 100, 1); // Assume 100 chars is full progress
  }

  /**
   * Get streaming text for a message
   */
  getStreamingText(messageId: string): string {
    const stream = this.activeStreams.get(messageId);
    return stream ? stream.content : '';
  }

  /**
   * Pause streaming for a message
   */
  async pauseStreaming(messageId: string): Promise<void> {
    const stream = this.activeStreams.get(messageId);
    if (!stream) {
      throw new Error(`No active stream found for message: ${messageId}`);
    }
    
    // For now, just log the pause action
    this.log(`Pausing streaming for message: ${messageId}`);
  }

  /**
   * Resume streaming for a message
   */
  async resumeStreaming(messageId: string): Promise<void> {
    const stream = this.activeStreams.get(messageId);
    if (!stream) {
      throw new Error(`No active stream found for message: ${messageId}`);
    }
    
    // For now, just log the resume action
    this.log(`Resuming streaming for message: ${messageId}`);
  }

  /**
   * Get the number of active streaming sessions
   */
  getActiveStreamingCount(): number {
    return this.activeStreams.size;
  }

  private async performStreaming(
    messageId: string,
    request: any,
    aiService: IAIService,
    streamSession: any
  ): Promise<void> {
    try {
      // Use the AI service's streaming method
      await aiService.sendMessageWithStreaming(
        request,
        {} as any, // session
        (chunk: string) => {
          if (!streamSession.isActive) {
            return; // Stream was stopped
          }

          // Update stream session
          streamSession.content += chunk;
          streamSession.chunkCount++;

          // Call the chunk callback
          streamSession.onChunk(chunk);

          // Publish streaming chunk event
          this.publishEvent({
            type: 'STREAMING_CHUNK',
            timestamp: Date.now(),
            messageId,
            chunk,
            chunkIndex: streamSession.chunkCount,
            totalContent: streamSession.content,
          });

          // Add delay between chunks for smooth streaming
          if (this.chunkDelay > 0) {
            setTimeout(() => {}, this.chunkDelay);
          }
        }
      );

      // Streaming completed
      if (streamSession.isActive) {
        streamSession.isActive = false;
        this.activeStreams.delete(messageId);

        // Call the complete callback
        streamSession.onComplete(streamSession.content);

        // Publish streaming ended event
        this.publishEvent({
          type: 'STREAMING_ENDED',
          timestamp: Date.now(),
          messageId,
          finalContent: streamSession.content,
          chunkCount: streamSession.chunkCount,
          duration: Date.now() - streamSession.startTime,
        });

        this.log(`Streaming completed for message: ${messageId}`);
      }

    } catch (error) {
      // Streaming failed
      streamSession.isActive = false;
      this.activeStreams.delete(messageId);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Call the error callback
      streamSession.onError(errorMessage);

      // Publish streaming failed event
      this.publishEvent({
        type: 'STREAMING_FAILED',
        timestamp: Date.now(),
        messageId,
        error: errorMessage,
        chunkCount: streamSession.chunkCount,
        duration: Date.now() - streamSession.startTime,
      });

      this.log(`Streaming failed for message ${messageId}: ${errorMessage}`, 'error');
      throw error;
    }
  }

  private setupEventSubscriptions(): void {
    // Subscribe to message events that might affect streaming
    this.subscribeToEvent('MESSAGE_CANCELLED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_CANCELLED') {
        // Stop streaming for cancelled message
        if (this.isStreaming(event.messageId!)) {
          await this.stopStreaming(event.messageId!);
        }
      }
    });

    this.subscribeToEvent('MESSAGE_DELETED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_DELETED') {
        // Stop streaming for deleted message
        if (this.isStreaming(event.messageId!)) {
          await this.stopStreaming(event.messageId!);
        }
      }
    });
  }
} 