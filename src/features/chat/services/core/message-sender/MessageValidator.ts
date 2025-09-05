import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";

import { getLogger } from "../../../../../shared/services/logger";
import { getModelInfo } from "../../../constants/models";
import { generateMessageId } from "../../../utils/messageIdGenerator";

export interface SendMessageRequest {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  model: string;
  regenerateIndex?: number;
  originalAssistantContent?: string;
  session: Session;
  messageId?: string;
  isSearchMode?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  userMsg?: ChatMessage;
  assistantMsg?: ChatMessage;
}

export class MessageValidator {
  private logger = getLogger("MessageValidator");

  validateRequest(
    request: SendMessageRequest,
    requestId: string
  ): ValidationResult {
    this.logger.debug("Starting validation for request", { requestId });

    const { userContent, model, isSearchMode } = request;

    // Validate search mode is supported for this model
    if (isSearchMode) {
      this.logger.debug("Checking search mode support for model", { model });
      const modelInfo = getModelInfo(model);
      if (!modelInfo?.capabilities.search) {
        const error = `Search is not supported for model: ${model}`;
        this.logger.error("Search validation failed", {
          requestId,
          error,
          model,
        });
        return { isValid: false, error };
      }
      this.logger.debug("Search mode validation passed for model", { model });
    }

    // Validate user content
    if (!userContent || userContent.trim().length === 0) {
      const error = "User content cannot be empty";
      this.logger.error("User content validation failed", {
        requestId,
        error,
      });
      return { isValid: false, error };
    }
    this.logger.debug("User content validation passed", {
      contentLength: userContent.length,
    });

    // Create user and assistant message objects
    const userMsg: ChatMessage = {
      role: "user",
      content: userContent,
      state: "completed", // User messages are immediately completed
      id: generateMessageId(),
    };

    const assistantMsg: ChatMessage = {
      role: "assistant",
      content: "",
      state: "loading", // Start in loading state
      id: request.messageId || generateMessageId(), // Use provided ID or generate new one
    };

    this.logger.debug("Created message objects", {
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      userContentLength: userContent.length,
    });

    return {
      isValid: true,
      userMsg,
      assistantMsg,
    };
  }
}
