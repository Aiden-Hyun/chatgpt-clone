import { IAnimationStrategy } from '../types/interfaces/IAnimationStrategy';

export class TypewriterAnimation implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 50; // Default 50ms per character
  private animationId: number | null = null;

  async animate(content: string, element: HTMLElement): Promise<void> {
    this.animating = true;
    this.progress = 0;
    element.textContent = '';
    
    for (let i = 0; i < content.length; i++) {
      if (!this.animating) break;
      
      element.textContent += content[i];
      this.progress = (i + 1) / content.length;
      await this.delay(this.speed);
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

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
} 