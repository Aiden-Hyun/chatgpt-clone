// src/features/chat/services/interfaces/IAnimationService.ts
export interface IAnimationService {
  /**
   * Animate response with typewriter effect
   */
  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    onComplete: () => void;
  }): void;
} 