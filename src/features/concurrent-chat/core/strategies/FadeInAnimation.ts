import { IAnimationStrategy } from '../types/interfaces/IAnimationStrategy';

export class FadeInAnimation implements IAnimationStrategy {
  private animating = false;
  private progress = 0;
  private speed = 100; // Default 100ms per step
  private animationId: number | null = null;

  async animate(content: string, element: HTMLElement): Promise<void> {
    this.animating = true;
    this.progress = 0;
    element.textContent = content;
    element.style.opacity = '0';
    element.style.transition = `opacity ${this.speed}ms ease-in`;
    
    await this.delay(50); // Small delay to ensure transition is applied
    element.style.opacity = '1';
    this.progress = 0.5;
    
    await this.delay(this.speed);
    this.progress = 1;
    this.animating = false;
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
    this.speed = Math.max(10, Math.min(1000, speed)); // Clamp between 10 and 1000ms
  }

  private async delay(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
} 