import type { ChatMessage } from "@/entities/message";

import { getLogger } from "../../../../../shared/services/logger";
import { IAnimationService } from "../../interfaces/IAnimationService";
import { IMessageStateService } from "../../interfaces/IMessageStateService";
import { ITypingStateService } from "../../interfaces/ITypingStateService";
import { LoggingService } from "../LoggingService";

export interface AnimationRequest {
  fullContent: string;
  regenerateIndex?: number;
  messageId?: string;
  requestId: string;
}

export class MessageAnimation {
  private readonly loggingService: LoggingService;
  private logger = getLogger("MessageAnimation");

  constructor(
    private animationService: IAnimationService,
    private messageStateService: IMessageStateService,
    private typingStateService: ITypingStateService
  ) {
    this.loggingService = new LoggingService("MessageAnimation");
  }

  updateUIState(request: {
    regenerateIndex?: number;
    userMsg: ChatMessage;
    assistantMsg: ChatMessage;
    messageId?: string;
    requestId: string;
  }): void {
    const { regenerateIndex, userMsg, assistantMsg, messageId, requestId } =
      request;

    this.messageStateService.updateMessageState({
      regenerateIndex,
      userMsg,
      assistantMsg,
      messageId,
    });

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

    this.logger.debug("Starting response animation for request", {
      requestId,
      contentLength: fullContent.length,
      regenerateIndex,
      messageId,
    });

    this.loggingService.debug(`Starting animation for request ${requestId}`, {
      messageId,
      regenerateIndex,
      contentLength: fullContent.length,
    });

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
