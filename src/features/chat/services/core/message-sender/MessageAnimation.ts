import type { ChatMessage } from "@/entities/message";
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

    console.log(
      "🎭 [MessageAnimation] Updating UI state for request:",
      requestId,
      {
        regenerateIndex,
        userMessageId: userMsg.id,
        assistantMessageId: assistantMsg.id,
      }
    );

    this.loggingService.debug(`Updating UI state for request ${requestId}`, {
      regenerateIndex,
      messageId,
    });

    this.messageStateService.updateMessageState({
      regenerateIndex,
      userMsg,
      assistantMsg,
      messageId,
    });

    // Only set typing for new messages, not for regeneration
    if (regenerateIndex === undefined) {
      console.log(
        "⌨️ [MessageAnimation] Setting typing indicator ON for new message"
      );
      this.typingStateService.setTyping(true);
    } else {
      console.log(
        "⌨️ [MessageAnimation] Skipping typing indicator for regeneration"
      );
    }

    console.log("✅ [MessageAnimation] UI state updated successfully");
  }

  animateResponse(request: AnimationRequest): void {
    const { fullContent, regenerateIndex, messageId, requestId } = request;

    console.log(
      "🎬 [MessageAnimation] Starting response animation for request:",
      requestId,
      {
        contentLength: fullContent.length,
        regenerateIndex,
        messageId,
      }
    );

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

    console.log("✅ [MessageAnimation] Animation started successfully");
  }

  clearTypingState(): void {
    console.log("⌨️ [MessageAnimation] Clearing typing indicator");
    this.typingStateService.setTyping(false);
    console.log("✅ [MessageAnimation] Typing indicator cleared");
  }
}
