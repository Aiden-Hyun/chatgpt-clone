import { IAnimationStrategy } from '../types/interfaces/IAnimationStrategy';

export class FadeInAnimation implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private duration = 500; // Default 500ms duration
  private animationId: number | null = null;
  private startTime = 0;
  private easingFunction: (t: number) => number = (t: number) => t; // Default linear easing
  private resolvePromise: (() => void) | null = null;

  async animate(content: string, elementOrCallback: HTMLElement | ((text: string, opacity: number) => void)): Promise<void> {
    // Validation
    if (content === null || content === undefined) {
      throw new Error('Content is required');
    }
    if (elementOrCallback === null || elementOrCallback === undefined) {
      throw new Error('Element or callback is required');
    }

    // Check if it's a callback function or HTMLElement
    if (typeof elementOrCallback === 'function') {
      return this.animateWithCallback(content, elementOrCallback);
    } else {
      return this.animateWithElement(content, elementOrCallback);
    }
  }

  private async animateWithElement(content: string, element: HTMLElement): Promise<void> {
    // Reset state
    this.animating = true;
    this.progress = 0;
    this.startTime = Date.now();
    element.textContent = content;
    element.style.opacity = '0';

    return new Promise<void>((resolve, reject) => {
      this.resolvePromise = resolve;
      
      const animateFrame = () => {
        if (!this.animating) {
          resolve();
          return;
        }

        try {
          const elapsed = Date.now() - this.startTime;
          const normalizedTime = Math.min(elapsed / this.duration, 1);
          const easedOpacity = this.easingFunction(normalizedTime);
          
          this.progress = normalizedTime;
          element.style.opacity = easedOpacity.toString();
          
          if (normalizedTime >= 1) {
            // Animation complete
            this.animating = false;
            this.progress = 1;
            element.style.opacity = '1';
            resolve();
          } else {
            // Continue animation
            this.animationId = window.requestAnimationFrame(animateFrame);
          }
        } catch (error) {
          this.animating = false;
          reject(error);
        }
      };

      // Handle zero duration case
      if (this.duration <= 0) {
        element.style.opacity = '1';
        this.animating = false;
        this.progress = 1;
        resolve();
        return;
      }

      // Start animation
      animateFrame();
    });
  }

  private async animateWithCallback(content: string, onUpdate: (text: string, opacity: number) => void): Promise<void> {
    // Reset state
    this.animating = true;
    this.progress = 0;
    this.startTime = Date.now();

    return new Promise<void>((resolve, reject) => {
      this.resolvePromise = resolve;
      
      const animateFrame = () => {
        if (!this.animating) {
          resolve();
          return;
        }

        try {
          const elapsed = Date.now() - this.startTime;
          const normalizedTime = Math.min(elapsed / this.duration, 1);
          const easedOpacity = this.easingFunction(normalizedTime);
          
          this.progress = normalizedTime;
          onUpdate(content, easedOpacity);
          
          if (normalizedTime >= 1) {
            // Animation complete
            this.animating = false;
            this.progress = 1;
            resolve();
          } else {
            // Continue animation
            this.animationId = window.requestAnimationFrame(animateFrame);
          }
        } catch (error) {
          this.animating = false;
          reject(error);
        }
      };

      // Handle zero duration case
      if (this.duration <= 0) {
        onUpdate(content, 1);
        this.animating = false;
        this.progress = 1;
        resolve();
        return;
      }

      // Start animation immediately
      animateFrame();
    });
  }

  stop(): void {
    this.animating = false;
    if (this.animationId) {
      window.cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    // Resolve the promise immediately if it exists
    if (this.resolvePromise) {
      this.resolvePromise();
      this.resolvePromise = null;
    }
  }

  isAnimating(): boolean {
    return this.animating;
  }

  getProgress(): number {
    return this.progress;
  }

  setSpeed(speed: number): void {
    this.duration = speed;
  }

  // Additional methods for fade-in specific functionality
  getDuration(): number {
    return this.duration;
  }

  setEasing(easingFunction: (t: number) => number): void {
    this.easingFunction = easingFunction;
  }
} 