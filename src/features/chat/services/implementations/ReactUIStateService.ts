// src/features/chat/services/implementations/ReactUIStateService.ts
import { IAnimationService } from '../interfaces/IAnimationService';
import { IDraftService } from '../interfaces/IDraftService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { ITypingStateService } from '../interfaces/ITypingStateService';
import { IUIStateService } from '../interfaces/IUIStateService';
// Removed: import { animateResponse } from '../legacy/animateResponse'; // No longer needed
import { handleDraftCleanup } from '../sendMessage/handleDraftCleanup';
import { handleMessageState } from '../sendMessage/handleMessageState';
import { ChatMessage } from '../types';

export class ReactUIStateService implements 
  IUIStateService, 
  IMessageStateService, 
  ITypingStateService, 
  IAnimationService, 
  IDraftService {
  
  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    private setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) {}

  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string; // ✅ Phase 2: Add message ID support
  }): void {
    handleMessageState({
      regenerateIndex: args.regenerateIndex,
      setMessages: this.setMessages,
      userMsg: args.userMsg,
      assistantMsg: args.assistantMsg,
      messageId: args.messageId, // ✅ Phase 2: Pass message ID to handler
    });
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }

  addErrorMessage(message: string): void {
    this.setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: message },
    ]);
  }

  cleanupDrafts(args: {
    isNewRoom: boolean;
    roomId: number;
  }): void {
    handleDraftCleanup({
      isNewRoom: args.isNewRoom,
      roomId: args.roomId,
      setDrafts: this.setDrafts,
    });
  }

  updateMessageContent(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void {
    // Update message content immediately for UI display
    
    // Update message content immediately without animation
    this.setMessages((prev) => {
      const updated = [...prev];
      
      let targetIndex: number;
      
      if (args.regenerateIndex !== undefined) {
        // For regeneration, use the specified index
        targetIndex = args.regenerateIndex;
      } else {
        // Find the last assistant message (usually empty/loading)
        targetIndex = updated.findLastIndex(msg => msg.role === 'assistant');
        
        // If no assistant message found, add a new one
        if (targetIndex === -1) {
          updated.push({ role: 'assistant', content: args.fullContent });
          return updated;
        }
      }
      
      // Update the target message with full content
      if (targetIndex >= 0 && targetIndex < updated.length) {
        updated[targetIndex] = { role: 'assistant', content: args.fullContent };
      }
      
      return updated;
    });
  }

  // REMOVED: animateResponse method - replaced with TypewriterText component
  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
    onComplete: () => void;
  }): void {
    // Legacy animation system disabled - using TypewriterText instead
    // Immediately call onComplete to maintain interface compatibility
    args.onComplete();
  }
} 