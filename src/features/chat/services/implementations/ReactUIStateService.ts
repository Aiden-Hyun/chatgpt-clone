// src/features/chat/services/implementations/ReactUIStateService.ts
import { IAnimationService } from '../interfaces/IAnimationService';
import { IDraftService } from '../interfaces/IDraftService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { ITypingStateService } from '../interfaces/ITypingStateService';
import { IUIStateService } from '../interfaces/IUIStateService';
// Removed: import { animateResponse } from '../legacy/animateResponse'; // No longer needed
import { handleDraftCleanup } from '../sendMessage/handleDraftCleanup';
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
    messageId?: string;
  }): void {
    // Inline message state handling (moved from deleted handleMessageState.ts)
    if (args.regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const updated = [...prev];
        // Update the assistant message at the regeneration index
        updated[args.regenerateIndex!] = { 
          ...updated[args.regenerateIndex!], 
          content: '', 
          state: 'loading'  // Set to loading state for regeneration
        };
        return updated;
      });
    } else {
      // Normal flow: add new user and assistant messages
      this.setMessages((prev) => {
        const enhancedAssistantMsg = args.messageId 
          ? { ...args.assistantMsg, id: args.messageId }
          : args.assistantMsg;
        
        return [...prev, args.userMsg, enhancedAssistantMsg];
      });
    }
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

  setMessageFullContentAndAnimate(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void {

    
    this.setMessages((prev) => {
      const updated = [...prev];
      
      let targetIndex: number;
      
      if (args.regenerateIndex !== undefined) {
        // For regeneration, use the specified index
        targetIndex = args.regenerateIndex;
      } else if (args.messageId) {
        // Find message by ID
        targetIndex = updated.findIndex(msg => msg.id === args.messageId);
      } else {
        // Find the last assistant message (fallback)
        targetIndex = updated.findLastIndex(msg => msg.role === 'assistant');
      }
      
      // Update the target message with full content and set to animating state
      if (targetIndex >= 0 && targetIndex < updated.length) {
        updated[targetIndex] = { 
          ...updated[targetIndex],
          fullContent: args.fullContent,
          content: args.fullContent, // Also update regular content
          state: 'animating'  // Trigger animation
        };
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