// src/features/chat/services/interfaces/IAnimationService.ts
export interface IAnimationService {
  /**
   * Set message content and animate with typewriter effect
   */
  setMessageFullContentAndAnimate(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void;
  
  /**
   * Legacy method for backwards compatibility
   */
  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
    onComplete: () => void;
  }): void;
} 