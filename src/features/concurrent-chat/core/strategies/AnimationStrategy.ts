import { IAnimationStrategy } from '../types/interfaces/IAnimationStrategy';

/**
 * Base class for animation strategies in the concurrent chat system
 * Provides common functionality and default implementations
 */
export abstract class AnimationStrategy implements IAnimationStrategy {
  protected animationSpeed: number = 50; // milliseconds per character
  protected easingFunction: (t: number) => number = (t) => t; // linear easing

  constructor(animationSpeed?: number, easingFunction?: (t: number) => number) {
    if (animationSpeed !== undefined) {
      this.animationSpeed = animationSpeed;
    }
    if (easingFunction !== undefined) {
      this.easingFunction = easingFunction;
    }
  }

  /**
   * Animate content on an element
   * @param content The content to animate
   * @param element The HTML element to animate on
   */
  abstract animate(content: string, element: HTMLElement): Promise<void>;

  /**
   * Set the animation speed
   * @param speed Speed in milliseconds per character
   */
  setAnimationSpeed(speed: number): void {
    this.animationSpeed = speed;
  }

  /**
   * Get the current animation speed
   * @returns Animation speed in milliseconds per character
   */
  getAnimationSpeed(): number {
    return this.animationSpeed;
  }

  /**
   * Set the easing function
   * @param easingFunction The easing function to use
   */
  setEasingFunction(easingFunction: (t: number) => number): void {
    this.easingFunction = easingFunction;
  }

  /**
   * Get the current easing function
   * @returns The current easing function
   */
  getEasingFunction(): (t: number) => number {
    return this.easingFunction;
  }

  /**
   * Calculate the delay for a specific character position
   * @param position The character position
   * @param totalLength The total content length
   * @returns Delay in milliseconds
   */
  protected calculateDelay(position: number, totalLength: number): number {
    const progress = position / totalLength;
    const easedProgress = this.easingFunction(progress);
    return easedProgress * this.animationSpeed;
  }

  /**
   * Create a delay promise
   * @param ms Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if animation should be skipped (for performance)
   * @param content The content to animate
   * @returns True if animation should be skipped
   */
  protected shouldSkipAnimation(content: string): boolean {
    return content.length === 0 || this.animationSpeed <= 0;
  }

  /**
   * Get animation metadata
   * @returns Animation metadata object
   */
  getMetadata(): {
    name: string;
    speed: number;
    supportsEasing: boolean;
  } {
    return {
      name: this.constructor.name,
      speed: this.animationSpeed,
      supportsEasing: true,
    };
  }
} 