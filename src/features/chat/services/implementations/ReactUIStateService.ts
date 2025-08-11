// src/features/chat/services/implementations/ReactUIStateService.ts
import { IAnimationService } from '../interfaces/IAnimationService';
import { IDraftService } from '../interfaces/IDraftService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { ITypingStateService } from '../interfaces/ITypingStateService';
import { IUIStateService } from '../interfaces/IUIStateService';
// Removed: import { animateResponse } from '../legacy/animateResponse'; // No longer needed
import { handleDraftCleanup } from '../sendMessage/handleDraftCleanup';
import { ChatMessage } from '../types';
import { MessageStateManager } from '../MessageStateManager';
import { generateMessageId } from '../../utils/messageIdGenerator';

export class ReactUIStateService implements 
  IUIStateService, 
  IMessageStateService, 
  ITypingStateService, 
  IAnimationService, 
  IDraftService {
  
  private messageStateManager: MessageStateManager;
  
  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private setIsTyping: React.Dispatch<React.SetStateAction<boolean>>,
    private setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>
  ) {
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
  }): void {
    // ✅ STATE MACHINE: Use MessageStateManager for consistent state management
    if (args.regenerateIndex !== undefined) {
      // For regeneration, find the message by index and start regeneration
      this.setMessages((prev) => {
        const messageToRegenerate = prev[args.regenerateIndex!];
        if (messageToRegenerate?.id) {
          // Use state manager for regeneration
          this.messageStateManager.startRegeneration(messageToRegenerate.id);
        } else {
          // Fallback for messages without ID (shouldn't happen in new system)
          const updated = [...prev];
          updated[args.regenerateIndex!] = { 
            ...updated[args.regenerateIndex!], 
            content: '', 
            state: 'loading',
            id: generateMessageId() // Assign ID if missing
          };
          return updated;
        }
        return prev; // State manager handles the update
      });
    } else {
      // ✅ STATE MACHINE: Create message pair atomically
      const userMessageId = args.userMsg.id || generateMessageId();
      const assistantMessageId = args.messageId || args.assistantMsg.id || generateMessageId();
      
      this.messageStateManager.createMessagePair(
        userMessageId,
        args.userMsg.content,
        assistantMessageId
      );
    }
  }

  setTyping(isTyping: boolean): void {
    this.setIsTyping(isTyping);
  }

  addErrorMessage(message: string): void {
    // ✅ STATE MACHINE: Create error message with proper state
    const errorMessageId = generateMessageId();
    this.setMessages((prev) => [
      ...prev,
      { 
        role: 'assistant', 
        content: message, 
        state: 'error',
        id: errorMessageId 
      },
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
    // ✅ STATE MACHINE: Use MessageStateManager for consistent state transitions
    if (args.messageId) {
      // Preferred: Use message ID for direct targeting
      this.messageStateManager.finishStreamingAndAnimate(args.messageId, args.fullContent);
    } else if (args.regenerateIndex !== undefined) {
      // Find message by index and use state manager
      this.setMessages((prev) => {
        const messageToUpdate = prev[args.regenerateIndex!];
        if (messageToUpdate?.id) {
          this.messageStateManager.finishStreamingAndAnimate(messageToUpdate.id, args.fullContent);
        }
        return prev; // State manager handles the update
      });
    } else {
      // Fallback: Find the last assistant message in loading state
      this.setMessages((prev) => {
        const lastLoadingAssistant = [...prev].reverse().find(
          msg => msg.role === 'assistant' && msg.state === 'loading'
        );
        if (lastLoadingAssistant?.id) {
          this.messageStateManager.finishStreamingAndAnimate(lastLoadingAssistant.id, args.fullContent);
        }
        return prev; // State manager handles the update
      });
    }
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