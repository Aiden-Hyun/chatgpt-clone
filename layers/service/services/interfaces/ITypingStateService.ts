// src/features/chat/services/interfaces/ITypingStateService.ts
export interface ITypingStateService {
  /**
   * Set typing state
   */
  setTyping(isTyping: boolean): void;
} 