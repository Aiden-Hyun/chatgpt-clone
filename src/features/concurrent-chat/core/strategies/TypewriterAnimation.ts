import { IAnimationStrategy } from '../types/interfaces/IAnimationStrategy';

export class TypewriterAnimation implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 50; // Default 50ms per character
  private animationId: number | null = null;
  private currentText = '';
  private currentIndex = 0;

  async animate(content: string, element: HTMLElement): Promise<void> {
    // Validation
    if (content === null || content === undefined) {
      throw new Error('Content is required');
    }
    if (element === null || element === undefined) {
      throw new Error('Element is required');
    }

    // Reset state
    this.animating = true;
    this.progress = 0;
    this.currentText = '';
    this.currentIndex = 0;
    element.textContent = '';

    return new Promise<void>((resolve, reject) => {
      const animateNextCharacter = () => {
        if (!this.animating) {
          resolve();
          return;
        }

        try {
          if (this.currentIndex < content.length) {
            this.currentText += content[this.currentIndex];
            this.currentIndex++;
            // Progress should be based on characters completed (currentIndex - 1) / total
            this.progress = (this.currentIndex - 1) / content.length;
            
            element.textContent = this.currentText;
            
            this.animationId = window.setTimeout(animateNextCharacter, this.speed);
          } else {
            // Animation complete
            this.animating = false;
            this.progress = 1;
            resolve();
          }
        } catch (error) {
          this.animating = false;
          reject(error);
        }
      };

      // Handle empty content case
      if (content.length === 0) {
        element.textContent = '';
        this.animating = false;
        this.progress = 1;
        resolve();
        return;
      }

      // Start animation
      animateNextCharacter();
    });
  }

  // Additional method for callback-based animation (for testing)
  async animateWithCallback(content: string, onUpdate: (text: string) => void): Promise<void> {
    // Validation
    if (content === null || content === undefined) {
      throw new Error('Content is required');
    }
    if (onUpdate === null || onUpdate === undefined) {
      throw new Error('Update callback is required');
    }

    // Reset state
    this.animating = true;
    this.progress = 0;
    this.currentText = '';
    this.currentIndex = 0;

    return new Promise<void>((resolve, reject) => {
      const animateNextCharacter = () => {
        if (!this.animating) {
          resolve();
          return;
        }

        try {
          if (this.currentIndex < content.length) {
            this.currentText += content[this.currentIndex];
            this.currentIndex++;
            // Progress should be based on characters completed (currentIndex - 1) / total
            this.progress = (this.currentIndex - 1) / content.length;
            
            onUpdate(this.currentText);
            
            this.animationId = window.setTimeout(animateNextCharacter, this.speed);
          } else {
            // Animation complete - call onUpdate one more time with final result
            this.animating = false;
            this.progress = 1;
            onUpdate(this.currentText);
            resolve();
          }
        } catch (error) {
          this.animating = false;
          reject(error);
        }
      };

      // Handle empty content case
      if (content.length === 0) {
        onUpdate('');
        this.animating = false;
        this.progress = 1;
        resolve();
        return;
      }

      // Start animation
      animateNextCharacter();
    });
  }

  stop(): void {
    this.animating = false;
    if (this.animationId) {
      window.clearTimeout(this.animationId);
      this.animationId = null;
    }
  }

  isAnimating(): boolean {
    return this.animating;
  }

  getProgress(): number {
    return this.progress;
  }

  setSpeed(speed: number): void {
    this.speed = speed;
  }

  // Additional method for getting current speed
  getSpeed(): number {
    return this.speed;
  }
} 