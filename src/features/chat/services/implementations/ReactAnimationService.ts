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
    if (args.messageId) {
      this.messageStateManager.finishStreamingAndAnimate(
        args.messageId,
        args.fullContent
      );
    } else if (args.regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToUpdate = prev[args.regenerateIndex!];
        if (messageToUpdate?.id) {
          this.messageStateManager.finishStreamingAndAnimate(
            messageToUpdate.id,
            args.fullContent
          );
        }
        return prev;
      });
    } else {
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
