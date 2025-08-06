export interface IAnimationStrategy {
  animate(content: string, element: HTMLElement): Promise<void>;
  stop(): void;
  isAnimating(): boolean;
  getProgress(): number;
  setSpeed(speed: number): void;
}

export class DefaultAnimationStrategy implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 1;
  private animationId: number | null = null;

  async animate(content: string, element: HTMLElement): Promise<void> {
    this.animating = true;
    this.progress = 0;
    element.textContent = '';
    
    const delay = 50 / this.speed; // Base delay adjusted by speed
    
    for (let i = 0; i < content.length; i++) {
      if (!this.animating) break;
      
      element.textContent += content[i];
      this.progress = (i + 1) / content.length;
      
      await new Promise(resolve => {
        this.animationId = window.setTimeout(resolve, delay);
      });
    }
    
    this.animating = false;
    this.progress = 1;
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
    this.speed = Math.max(0.1, Math.min(10, speed)); // Clamp between 0.1 and 10
  }
}

export function createAnimationStrategy(): IAnimationStrategy {
  return new DefaultAnimationStrategy();
} 