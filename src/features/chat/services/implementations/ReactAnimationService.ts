// src/features/chat/services/implementations/ReactAnimationService.ts
import { IAnimationService } from '../interfaces/IAnimationService';
import { MessageStateManager } from '../MessageStateManager';
import { ChatMessage } from '../types';

export class ReactAnimationService implements IAnimationService {
  private messageStateManager: MessageStateManager;

  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    console.log('[Service] ReactAnimationService initialized');
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  setMessageFullContentAndAnimate(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
  }): void {
    // Case 1: Regeneration by index - uses the new unified regeneration method
    if (args.regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToUpdate = prev[args.regenerateIndex!];
        if (messageToUpdate?.id) {
          // Use our unified regeneration handler
          this.messageStateManager.handleRegeneration(
            messageToUpdate.id,
            args.fullContent
          );
        }
        return prev;
      });
      return;
    }
    
    // Case 2: Direct message ID
    if (args.messageId) {
      // For new messages, use regular animation
      this.messageStateManager.finishStreamingAndAnimate(
        args.messageId,
        args.fullContent
      );
      return;
    }
    
    // Case 3: Normal case for new messages (find last loading message)
    this.setMessages((prev) => {
      const lastLoadingAssistant = [...prev]
        .reverse()
        .find(
          (msg) => msg.role === 'assistant' && msg.state === 'loading'
        );
      if (lastLoadingAssistant?.id) {
        this.messageStateManager.finishStreamingAndAnimate(
          lastLoadingAssistant.id,
          args.fullContent
        );
      }
      return prev;
    });
  }

  animateResponse(args: {
    fullContent: string;
    regenerateIndex?: number;
    messageId?: string;
    onComplete: () => void;
  }): void {
    args.onComplete();
  }
}
