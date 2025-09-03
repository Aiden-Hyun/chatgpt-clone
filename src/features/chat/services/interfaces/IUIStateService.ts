// src/features/chat/services/interfaces/IUIStateService.ts
import type { ChatMessage } from "@/entities/message";

export interface IUIStateService {
  /**
   * Update message state for new messages or regeneration
   */
  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string; // ✅ Phase 2: Add message ID support
  }): void;

  /**
   * Set typing state
   */
  setTyping(isTyping: boolean): void;

  /**
   * Add error message to chat
   */
  addErrorMessage(message: string): void;

  // Draft cleanup removed from UI service; handled in hooks/storage

  /**
   * Set message full content and transition to animating state
   */
  setMessageFullContentAndAnimate(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void;

  /**
   * Animate response with typewriter effect
   */
  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string; // ✅ Phase 2: Add message ID support
    onComplete: () => void;
  }): void;
}
