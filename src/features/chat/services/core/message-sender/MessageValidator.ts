import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";
import { getModelInfo } from "../../../constants/models";
import { generateMessageId } from "../../../utils/messageIdGenerator";
import { LoggingService } from "../LoggingService";

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
  private readonly loggingService: LoggingService;

  constructor() {
    this.loggingService = new LoggingService("MessageValidator");
  }

  validateRequest(
    request: SendMessageRequest,
    requestId: string
  ): ValidationResult {
    console.log(
      "🔍 [MessageValidator] Starting validation for request:",
      requestId
    );

    const { userContent, model, isSearchMode } = request;

    // Validate search mode is supported for this model
    if (isSearchMode) {
      console.log(
        "🔍 [MessageValidator] Checking search mode support for model:",
        model
      );
      const modelInfo = getModelInfo(model);
      if (!modelInfo?.capabilities.search) {
        const error = `Search is not supported for model: ${model}`;
        console.error("❌ [MessageValidator] Search validation failed:", error);
        this.loggingService.error(
          `Search validation failed for request ${requestId}`,
          { error, model }
        );
        return { isValid: false, error };
      }
      console.log(
        "✅ [MessageValidator] Search mode validation passed for model:",
        model
      );
    }

    // Validate user content
    if (!userContent || userContent.trim().length === 0) {
      const error = "User content cannot be empty";
      console.error(
        "❌ [MessageValidator] User content validation failed:",
        error
      );
      this.loggingService.error(
        `User content validation failed for request ${requestId}`,
        { error }
      );
      return { isValid: false, error };
    }
    console.log(
      "✅ [MessageValidator] User content validation passed, length:",
      userContent.length
    );

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

    console.log("🔧 [MessageValidator] Created message objects:", {
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      userContentLength: userContent.length,
    });

    this.loggingService.debug(`Validation passed for request ${requestId}`, {
      userMessageId: userMsg.id,
      assistantMessageId: assistantMsg.id,
      contentLength: userContent.length,
    });

    return {
      isValid: true,
      userMsg,
      assistantMsg,
    };
  }
}
