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