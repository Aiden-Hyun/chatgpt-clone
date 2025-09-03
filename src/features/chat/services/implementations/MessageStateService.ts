// src/features/chat/services/implementations/MessageStateService.ts
import type { ChatMessage } from "@/entities/message";

import { generateMessageId } from "../../utils/messageIdGenerator";
import { IMessageStateService } from "../interfaces/IMessageStateService";
import { MessageStateManager } from "../MessageStateManager";

export class MessageStateService implements IMessageStateService {
  private messageStateManager: MessageStateManager;

  constructor(
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>
  ) {
    console.log("[Service] MessageStateService initialized");
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
          // Forward to the MessageStateManager
          // We can't call handleRegeneration here directly as we don't have new content yet
          // Just mark for regeneration and let MessageAnimationService handle full regeneration later
          this.messageStateManager.transition(
            messageToRegenerate.id,
            "loading"
          );
        } else {
          const updated = [...prev];
          updated[args.regenerateIndex!] = {
            ...updated[args.regenerateIndex!],
            content: "",
            state: "loading",
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
        role: "assistant",
        content: message,
        state: "error",
        id: errorMessageId,
      },
    ]);
  }

  markMessageErrorById(messageId: string, errorMessage?: string): void {
    this.setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          return {
            ...msg,
            content: errorMessage ?? (msg.content || "An error occurred"),
            state: "error",
          } as ChatMessage;
        }
        return msg;
      })
    );
  }

  markLastAssistantLoadingAsError(errorMessage?: string): void {
    this.setMessages((prev) => {
      for (let i = prev.length - 1; i >= 0; i--) {
        const msg = prev[i];
        if (msg.role === "assistant" && msg.state === "loading") {
          const updated = [...prev];
          updated[i] = {
            ...msg,
            content: errorMessage ?? (msg.content || "An error occurred"),
            state: "error",
          } as ChatMessage;
          return updated;
        }
      }
      return prev;
    });
  }
}
