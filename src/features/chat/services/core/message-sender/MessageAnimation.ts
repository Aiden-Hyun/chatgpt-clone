import type { ChatMessage } from "@/entities/message";

import { getLogger } from "../../../../../shared/services/logger";
import { generateMessageId } from "../../../utils/messageIdGenerator";
import { IAnimationService } from "../../interfaces/IAnimationService";
import { MessageStateManager } from "../../MessageStateManager";

export interface AnimationRequest {
  fullContent: string;
  regenerateIndex?: number;
  messageId?: string;
  requestId: string;
}

export class MessageAnimation {
  private readonly logger = getLogger("MessageAnimation");
  private readonly messageStateManager: MessageStateManager;

  constructor(
    private animationService: IAnimationService,
    private setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>,
    private typingStateService: { setTyping: (isTyping: boolean) => void }
  ) {
    this.messageStateManager = new MessageStateManager(setMessages);
  }

  updateUIState(request: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
    requestId: string;
  }): void {
    const { regenerateIndex, userMsg, assistantMsg, messageId } = request;

    // Inlined from MessageStateService.updateMessageState()
    if (regenerateIndex !== undefined) {
      this.setMessages((prev) => {
        const messageToRegenerate = prev[regenerateIndex];
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
          updated[regenerateIndex] = {
            ...updated[regenerateIndex],
            content: "",
            state: "loading",
            id: generateMessageId(),
          };
          return updated;
        }
        return prev;
      });
    } else {
      const userMessageId = userMsg.id || generateMessageId();
      const assistantMessageId =
        messageId || assistantMsg.id || generateMessageId();

      this.messageStateManager.createMessagePair(
        userMessageId,
        userMsg.content,
        assistantMessageId
      );
    }

    // Only set typing for new messages, not for regeneration
    if (regenerateIndex === undefined) {
      this.logger.debug("Setting typing indicator ON for new message");
      this.typingStateService.setTyping(true);
    } else {
      this.logger.debug("Skipping typing indicator for regeneration");
    }

    this.logger.debug("UI state updated successfully");
  }

  animateResponse(request: AnimationRequest): void {
    const { fullContent, regenerateIndex, messageId, requestId } = request;

    this.logger.debug(
      `Starting response animation for request ${requestId} (${
        fullContent.length
      } chars, message ${messageId}, regeneration: ${
        regenerateIndex !== undefined ? "yes" : "no"
      })`
    );

    // Set full content and transition to animating state
    this.animationService.setMessageFullContentAndAnimate({
      fullContent,
      regenerateIndex,
      messageId,
    });
  }

  clearTypingState(): void {
    this.typingStateService.setTyping(false);
  }
}
