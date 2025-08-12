// src/features/chat/services/implementations/ReactMessageStateService.ts
import { generateMessageId } from '../../utils/messageIdGenerator';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { MessageStateManager } from '../MessageStateManager';
import { ChatMessage } from '../types';

export class ReactMessageStateService implements IMessageStateService {
  private messageStateManager: MessageStateManager;

  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    console.log('[Service] ReactMessageStateService initialized');
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  updateMessageState(args: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
  }): void {
    if (args.regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToRegenerate = prev[args.regenerateIndex!];
        if (messageToRegenerate?.id) {
          this.messageStateManager.startRegeneration(messageToRegenerate.id);
        } else {
          const updated = [...prev];
          updated[args.regenerateIndex!] = {
            ...updated[args.regenerateIndex!],
            content: '',
            state: 'loading',
            id: generateMessageId(),
          };
          return updated;
        }
        return prev;
      });
    } else {
      const userMessageId = args.userMsg.id || generateMessageId();
      const assistantMessageId =
        args.messageId || args.assistantMsg.id || generateMessageId();

      this.messageStateManager.createMessagePair(
        userMessageId,
        args.userMsg.content,
        assistantMessageId
      );
    }
  }

  addErrorMessage(message: string): void {
    const errorMessageId = generateMessageId();
    this.setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: message,
        state: 'error',
        id: errorMessageId,
      },
    ]);
  }
}
