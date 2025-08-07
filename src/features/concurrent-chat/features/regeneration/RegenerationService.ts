import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { MessageEvent } from '../../core/types/events/MessageEvents';
import { IAIService } from '../../core/types/interfaces/IAIService';
import { ConcurrentMessage } from '../../core/types/interfaces/IMessageProcessor';
import { BasePlugin } from '../../plugins/BasePlugin';

/**
 * Regeneration Service Plugin
 * Handles message regeneration and provides regeneration functionality
 */
export class RegenerationService extends BasePlugin {
  private regenerationQueue = new Map<string, Promise<ConcurrentMessage>>();
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // 1 second

  constructor(eventBus: EventBus, container: ServiceContainer) {
    super('regeneration-service', 'Regeneration Service', '1.0.0', eventBus, container);
  }

  async init(): Promise<void> {
    try {
      this.log('Initializing Regeneration Service');
      
      // Set up event subscriptions
      this.setupEventSubscriptions();
      
      this.log('Regeneration Service initialized successfully');
    } catch (error) {
      this.log(`Failed to initialize Regeneration Service: ${error}`, 'error');
      throw error;
    }
  }

  async destroy(): Promise<void> {
    try {
      this.log('Destroying Regeneration Service');
      
      // Cancel all pending regenerations
      await this.cancelAllRegenerations();
      
      // Clean up event subscriptions
      this.cleanupSubscriptions();
      
      this.log('Regeneration Service destroyed successfully');
    } catch (error) {
      this.log(`Failed to destroy Regeneration Service: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Regenerate a message
   */
  async regenerateMessage(
    messageId: string,
    context: ConcurrentMessage[],
    model?: string
  ): Promise<ConcurrentMessage> {
    if (this.regenerationQueue.has(messageId)) {
      throw new Error(`Regeneration already in progress for message: ${messageId}`);
    }

    try {
      this.log(`Starting regeneration for message: ${messageId}`);
      
      // Publish regeneration started event
      this.publishEvent({
        type: 'REGENERATION_REQUESTED',
        timestamp: Date.now(),
        messageId,
        message: context[context.length - 1], // Use the last message as the one being regenerated
        context,
      });

      // Get AI service from container
      const aiService = this.container.get<IAIService>('aiService');
      
      // Create regeneration promise
      const regenerationPromise = this.performRegeneration(messageId, context, model, aiService);
      this.regenerationQueue.set(messageId, regenerationPromise);

      const regeneratedMessage = await regenerationPromise;
      
      this.log(`Regeneration completed for message: ${messageId}`);
      return regeneratedMessage;

    } catch (error) {
      this.log(`Regeneration failed for message ${messageId}: ${error}`, 'error');
      
      // Publish regeneration failed event
      this.publishEvent({
        type: 'REGENERATION_FAILED',
        timestamp: Date.now(),
        messageId,
        message: context[context.length - 1], // Use the last message as the one being regenerated
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      this.regenerationQueue.delete(messageId);
    }
  }

  /**
   * Cancel regeneration for a specific message
   */
  async cancelRegeneration(messageId: string): Promise<void> {
    const regeneration = this.regenerationQueue.get(messageId);
    if (regeneration) {
      // Note: This is a simplified cancellation
      // In a real implementation, you'd need to implement proper cancellation
      this.regenerationQueue.delete(messageId);
      this.log(`Cancelled regeneration for message: ${messageId}`);
      
      // Publish regeneration cancelled event
      this.publishEvent({
        type: 'REGENERATION_CANCELLED',
        timestamp: Date.now(),
        messageId,
        message: { id: messageId, content: '', role: 'assistant', status: 'cancelled', timestamp: Date.now() } as ConcurrentMessage,
      });
    }
  }

  /**
   * Cancel all pending regenerations
   */
  async cancelAllRegenerations(): Promise<void> {
    const messageIds = Array.from(this.regenerationQueue.keys());
    await Promise.all(messageIds.map(id => this.cancelRegeneration(id)));
    this.log(`Cancelled all regenerations (${messageIds.length} total)`);
  }

  /**
   * Check if a message is currently being regenerated
   */
  isRegenerating(messageId: string): boolean {
    return this.regenerationQueue.has(messageId);
  }

  /**
   * Get the number of pending regenerations
   */
  getPendingRegenerationCount(): number {
    return this.regenerationQueue.size;
  }

  /**
   * Set the maximum number of retries for regeneration
   */
  setMaxRetries(maxRetries: number): void {
    this.maxRetries = Math.max(1, maxRetries);
    this.log(`Set max retries to: ${this.maxRetries}`);
  }

  /**
   * Get the maximum number of retries
   */
  getMaxRetries(): number {
    return this.maxRetries;
  }

  /**
   * Set the retry delay in milliseconds
   */
  setRetryDelay(delay: number): void {
    this.retryDelay = Math.max(100, delay);
    this.log(`Set retry delay to: ${this.retryDelay}ms`);
  }

  /**
   * Get the retry delay in milliseconds
   */
  getRetryDelay(): number {
    return this.retryDelay;
  }

  /**
   * Get regeneration statistics
   */
  getRegenerationStats(): {
    pendingRegenerations: number;
    maxRetries: number;
    retryDelay: number;
    queueSize: number;
  } {
    return {
      pendingRegenerations: this.regenerationQueue.size,
      maxRetries: this.maxRetries,
      retryDelay: this.retryDelay,
      queueSize: this.regenerationQueue.size,
    };
  }

  private async performRegeneration(
    messageId: string,
    context: ConcurrentMessage[],
    model: string | undefined,
    aiService: IAIService
  ): Promise<ConcurrentMessage> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.log(`Regeneration attempt ${attempt}/${this.maxRetries} for message: ${messageId}`);

        // Create the regeneration request
        const request = {
          messages: context.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          model: model || 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
        };

        // Get session from container
        let session = null;
        try {
          session = this.container.get('session');
          if (!session || !session.access_token) {
            throw new Error('No valid session found');
          }
          console.log('🔄 [REGENERATION] Session found for user: ${session.user?.email || \'unknown\'}');
        } catch (error) {
          throw new Error('No active session found. Please ensure you are logged in before regenerating messages.');
        }

        // Send regeneration request
        console.log('🔄 [REGENERATION] Calling AI service with request...');
        const response = await aiService.sendMessage(request, session);
        console.log('🔄 [REGENERATION] AI service response:', response);

        // Create regenerated message
        const regeneratedMessage: ConcurrentMessage = {
          id: `${messageId}_regenerated_${Date.now()}`,
          content: response.choices?.[0]?.message?.content || 'Regeneration failed',
          role: 'assistant',
          status: 'completed',
          timestamp: Date.now(),
          model: model || 'gpt-3.5-turbo',
        };

        // Publish regeneration completed event
        this.publishEvent({
          type: 'REGENERATION_COMPLETED',
          timestamp: Date.now(),
          messageId,
          message: context[context.length - 1], // Use the last message as the one being regenerated
          regeneratedMessage,
        });

        return regeneratedMessage;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        this.log(`Regeneration attempt ${attempt} failed: ${lastError.message}`, 'warn');

        if (attempt < this.maxRetries) {
          // Wait before retrying
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }

    // All attempts failed
    throw new Error(`Regeneration failed after ${this.maxRetries} attempts: ${lastError?.message}`);
  }

  private setupEventSubscriptions(): void {
    // Subscribe to message events that might trigger regeneration
    this.subscribeToEvent('MESSAGE_FAILED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_FAILED') {
        this.log(`Message failed, ready for regeneration: ${event.messageId}`);
      }
    });

    this.subscribeToEvent('MESSAGE_CANCELLED', async (event: MessageEvent) => {
      if (event.type === 'MESSAGE_CANCELLED') {
        // Cancel regeneration for cancelled message
        await this.cancelRegeneration(event.messageId!);
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 