// src/features/chat/services/interfaces/IUIStateService.ts
import { ChatMessage } from '../types';

export interface IUIStateService {
  /**
   * Update message state for new messages or regeneration
   */
  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
  }): void;
  
  /**
   * Set typing state
   */
  setTyping(isTyping: boolean): void;
  
  /**
   * Add error message to chat
   */
  addErrorMessage(message: string): void;
  
  /**
   * Clean up draft messages
   */
  cleanupDrafts(args: {
    isNewRoom: boolean;
    roomId: number;
  }): void;
  
  /**
   * Animate response with typewriter effect
   */
  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    onComplete: () => void;
  }): void;
} 