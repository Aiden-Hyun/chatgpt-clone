import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { FadeInAnimation } from '../../core/strategies/FadeInAnimation';
import { TypewriterAnimation } from '../../core/strategies/TypewriterAnimation';
import { IAnimationStrategy } from '../../core/types/interfaces/IAnimationStrategy';
import { BasePlugin } from '../../plugins/BasePlugin';

/**
 * Animation Service Plugin
 * Handles message animations and provides animation strategies
 */
export class AnimationService extends BasePlugin {
  private strategies = new Map<string, IAnimationStrategy>();
  private defaultStrategy: string = 'typewriter';
  private plugins: any[] = [];
  private speed: number = 1.0;
  private paused: boolean = false;
  private currentAnimation: Promise<void> | null = null;
  private shouldStop: boolean = false;
  private currentStrategy: IAnimationStrategy | null = null;

  constructor(eventBus: EventBus, container: ServiceContainer) {
    super('animation-service', 'Animation Service', '1.0.0', eventBus, container);
    
    // Register with service container
    container.register('animationService', this);
    
    // Subscribe to animation events
    this.setupEventSubscriptions();
    
    // Register default strategies
    this.registerDefaultStrategies();
  }

  async init(): Promise<void> {
    // Animation service is initialized in constructor
  }

  async destroy(): Promise<void> {
    // Cleanup if needed
  }

  /**
   * Get all available animation strategies
   */
  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Register an animation strategy
   */
  registerStrategy(name: string, strategy: IAnimationStrategy): void {
    this.strategies.set(name, strategy);
  }

  /**
   * Get an animation strategy by name
   */
  getStrategy(name: string): IAnimationStrategy {
    const strategy = this.strategies.get(name);
    if (strategy) {
      return strategy;
    }
    
    // Return default strategy if not found
    const defaultStrategy = this.strategies.get(this.defaultStrategy) || this.strategies.get('typewriter');
    if (defaultStrategy) {
      return defaultStrategy;
    }
    
    // Return a fallback strategy if none available
    return new TypewriterAnimation();
  }

  /**
   * Animate a message with the specified strategy
   */
  async animateMessage(
    messageId: string,
    content: string,
    element: HTMLElement,
    strategyName?: string
  ): Promise<void> {
    try {
      this.log(`Starting animation for message: ${messageId} with strategy: ${strategyName || this.defaultStrategy}`);
      
      // Publish animation start event
      this.eventBus.publish('animation:start', {
        messageId,
        content,
        strategy: strategyName || this.defaultStrategy,
      });

      // For React Native, we'll use a simplified animation approach
      // since we can't directly animate HTMLElement
      if (strategyName === 'typewriter' || !strategyName) {
        // Simulate typewriter effect
        await this.simulateTypewriterAnimation(messageId, content);
      } else if (strategyName === 'fadeIn') {
        // Simulate fade-in effect
        await this.simulateFadeInAnimation(messageId, content);
      }

      // Publish animation complete event
      this.eventBus.publish('animation:complete', {
        messageId,
        content,
        strategy: strategyName || this.defaultStrategy,
      });

      this.log(`Animation completed for message: ${messageId}`);
    } catch (error) {
      this.log(`Animation failed for message ${messageId}: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Animate content with the specified strategy
   */
  async animate(
    element: HTMLElement, 
    content: string, 
    strategyName?: string, 
    options?: any
  ): Promise<void> {
    const strategy = strategyName ? this.getStrategy(strategyName) : this.getStrategy(this.defaultStrategy);
    
    // Reset stop flag
    this.shouldStop = false;
    
    // Publish animation start event
    this.eventBus.publish('animation:start', {
      element,
      content,
      strategy: strategyName || this.defaultStrategy,
    });

    // Notify plugins
    this.plugins.forEach(plugin => {
      if (plugin.onAnimationStart) {
        try {
          plugin.onAnimationStart(element, content, strategyName || this.defaultStrategy);
        } catch (error) {
          // Ignore plugin errors
        }
      }
    });

    try {
      // Store the current animation promise and strategy
      this.currentAnimation = strategy.animate(content, element);
      this.currentStrategy = strategy;
      await this.currentAnimation;
      
      // Check if animation was stopped
      if (this.shouldStop) {
        throw new Error('Animation stopped');
      }
      
      // Publish animation complete event
      this.eventBus.publish('animation:complete', {
        element,
        content,
        strategy: strategyName || this.defaultStrategy,
      });
      
      // Publish animation progress event
      this.eventBus.publish('animation:progress', {
        element,
        progress: 1.0,
        strategy: strategyName || this.defaultStrategy,
      });

      // Notify plugins
      this.plugins.forEach(plugin => {
        if (plugin.onAnimationComplete) {
          try {
            plugin.onAnimationComplete(element, content, strategyName || this.defaultStrategy);
          } catch (error) {
            // Ignore plugin errors
          }
        }
      });
    } catch (error) {
      // Publish animation error event
      this.eventBus.publish('animation:error', {
        element,
        content,
        strategy: strategyName || this.defaultStrategy,
        error: error instanceof Error ? error : new Error('Unknown error'),
      });
      throw error;
    } finally {
      this.currentAnimation = null;
      this.currentStrategy = null;
    }
  }

  /**
   * Pause animation
   */
  pause(): void {
    this.paused = true;
  }

  /**
   * Resume animation
   */
  resume(): void {
    this.paused = false;
  }

  /**
   * Stop animation
   */
  async stop(): Promise<void> {
    this.shouldStop = true;
    this.paused = true;
    
    // Stop the current strategy if it's running
    if (this.currentStrategy) {
      this.currentStrategy.stop();
    }
  }

  /**
   * Set animation speed
   */
  setSpeed(speed: number): void {
    this.speed = speed;
  }

  /**
   * Get animation speed
   */
  getSpeed(): number {
    return this.speed;
  }

  /**
   * Register a plugin
   */
  registerPlugin(plugin: any): void {
    this.plugins.push(plugin);
  }

  /**
   * Get all plugins
   */
  getPlugins(): any[] {
    return this.plugins;
  }

  /**
   * Set the default animation strategy
   */
  setDefaultStrategy(name: string): void {
    if (this.strategies.has(name)) {
      this.defaultStrategy = name;
    }
  }

  /**
   * Get the default animation strategy name
   */
  getDefaultStrategy(): string {
    return this.defaultStrategy;
  }

  /**
   * Get the number of active animations
   */
  getActiveAnimationCount(): number {
    // For now, return 1 if there's a current animation, 0 otherwise
    return this.currentAnimation ? 1 : 0;
  }

  /**
   * Get animation statistics
   */
  getAnimationStats(): any {
    return {
      activeCount: this.getActiveAnimationCount(),
      defaultStrategy: this.defaultStrategy,
      availableStrategies: this.getAvailableStrategies(),
      speed: this.speed,
      paused: this.paused
    };
  }

  /**
   * Simulate typewriter animation for React Native
   */
  private async simulateTypewriterAnimation(messageId: string, content: string): Promise<void> {
    // For React Native, we'll just simulate the animation with a delay
    // In a real implementation, you'd use React Native's Animated API
    const delay = 50; // 50ms per character
    const totalDelay = content.length * delay;
    
    this.log(`Simulating typewriter animation for message: ${messageId} (${content.length} chars, ${totalDelay}ms)`);
    
    // Simulate animation duration
    await new Promise(resolve => setTimeout(resolve, totalDelay));
  }

  /**
   * Simulate fade-in animation for React Native
   */
  private async simulateFadeInAnimation(messageId: string, content: string): Promise<void> {
    // For React Native, we'll just simulate the animation with a delay
    // In a real implementation, you'd use React Native's Animated API
    const delay = 500; // 500ms fade-in
    
    this.log(`Simulating fade-in animation for message: ${messageId} (${delay}ms)`);
    
    // Simulate animation duration
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Cancel animation for a specific message
   */
  async cancelAnimation(messageId: string): Promise<void> {
    this.log(`Cancelling animation for message: ${messageId}`);
    // For now, just log the cancellation
  }

  /**
   * Cancel all active animations
   */
  async cancelAllAnimations(): Promise<void> {
    this.log('Cancelling all active animations');
    // For now, just log the cancellation
  }

  /**
   * Check if a message is currently being animated
   */
  isAnimating(messageId: string): boolean {
    // For now, return false since we don't track active animations
    return false;
  }

  private setupEventSubscriptions(): void {
    // Subscribe to animation events
    this.eventBus.subscribe('animation:start', async (event: any) => {
      // Handle animation start events
    });

    this.eventBus.subscribe('animation:complete', async (event: any) => {
      // Handle animation complete events
    });

    this.eventBus.subscribe('animation:error', async (event: any) => {
      // Handle animation error events
    });
  }

  private registerDefaultStrategies(): void {
    // Register default strategies
    this.registerStrategy('typewriter', new TypewriterAnimation());
    this.registerStrategy('fade-in', new FadeInAnimation());
  }
} 