import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";

import { ROOM_NAME_MAX_LENGTH } from "../../../constants";
import { IChatRoomService } from "../../interfaces/IChatRoomService";
import { IMessageService } from "../../interfaces/IMessageService";
import { LoggingService } from "../LoggingService";
import { RetryService } from "../RetryService";

export interface PersistenceRequest {
  roomId: number;
  userMsg: ChatMessage;
  assistantMsg: ChatMessage;
  fullContent: string;
  regenerateIndex?: number;
  originalAssistantContent?: string;
  session: Session;
  requestId: string;
}

export class MessagePersistence {
  private readonly retryService: RetryService;
  private readonly loggingService: LoggingService;

  constructor(
    private chatRoomService: IChatRoomService,
    private messageService: IMessageService
  ) {
    this.retryService = new RetryService({
      maxRetries: 3,
      retryDelay: 1000,
      exponentialBackoff: true,
    });
    this.loggingService = new LoggingService("MessagePersistence");
  }

  async persistMessages(request: PersistenceRequest): Promise<void> {
    const {
      roomId,
      userMsg,
      assistantMsg,
      fullContent,
      regenerateIndex,
      originalAssistantContent,
      session,
      requestId,
    } = request;

    console.log(
      "💾 [MessagePersistence] Starting message persistence for request:",
      requestId,
      {
        roomId,
        regenerateIndex,
        contentLength: fullContent.length,
      }
    );

    try {
      this.loggingService.debug(
        `Starting persistence for request ${requestId}`,
        {
          regenerateIndex,
          roomId,
        }
      );

      // Handle database operations
      if (regenerateIndex !== undefined) {
        console.log(
          "🔄 [MessagePersistence] Processing regeneration for index:",
          regenerateIndex
        );
        if (originalAssistantContent) {
          this.loggingService.debug(
            `Updating regenerated message for request ${requestId}`,
            { regenerateIndex }
          );
          await this.retryService.retryOperation(
            () =>
              this.messageService.updateAssistantMessage({
                roomId,
                newContent: fullContent,
                originalContent: originalAssistantContent,
                session,
              }),
            "message update"
          );
          console.log(
            "✅ [MessagePersistence] Successfully updated regenerated message"
          );
        }
      } else {
        // Insert messages on the client for both new and existing rooms
        console.log(
          "📝 [MessagePersistence] Inserting new messages for room:",
          roomId
        );
        this.loggingService.debug(
          `Inserting messages for request ${requestId}`
        );
        await this.retryService.retryOperation(
          () =>
            this.messageService.insertMessages({
              roomId,
              userMessage: userMsg,
              assistantMessage: {
                role: "assistant",
                content: fullContent,
                id: assistantMsg.id,
              },
              session,
            }),
          "message insertion"
        );
        console.log(
          "✅ [MessagePersistence] Successfully inserted new messages"
        );
      }

      // Update room metadata (non-critical operation)
      console.log(
        "🏠 [MessagePersistence] Updating room metadata for room:",
        roomId
      );
      this.loggingService.debug(
        `Updating room metadata for request ${requestId}`,
        { roomId }
      );
      try {
        await this.chatRoomService.updateRoom(roomId, {
          name: userMsg.content.slice(0, ROOM_NAME_MAX_LENGTH),
          updatedAt: new Date().toISOString(),
        });
        console.log(
          "✅ [MessagePersistence] Successfully updated room metadata"
        );
      } catch (error) {
        // Room update is not critical - log but don't fail the entire operation
        console.warn(
          "⚠️ [MessagePersistence] Room update failed but continuing:",
          error
        );
        this.loggingService.warn(
          `Room update failed for request ${requestId}, but continuing`,
          { error }
        );
      }

      this.loggingService.info(
        `Persistence completed for request ${requestId}`
      );
      console.log(
        "🎉 [MessagePersistence] All persistence operations completed successfully"
      );
    } catch (error) {
      console.error("❌ [MessagePersistence] Persistence failed:", error);
      this.loggingService.error(`Persistence failed for request ${requestId}`, {
        error,
      });
      throw error;
    }
  }

  async createRoomIfNeeded(
    numericRoomId: number | null,
    session: Session,
    model: string,
    requestId: string
  ): Promise<{ roomId: number; isNewRoom: boolean }> {
    let roomId = numericRoomId;
    let isNewRoom = false;

    console.log(
      "🏗️ [MessagePersistence] Checking if room creation is needed:",
      { numericRoomId, model }
    );

    if (!roomId) {
      console.log(
        "🏗️ [MessagePersistence] Creating new room for model:",
        model
      );
      this.loggingService.info(
        `Creating new room up front for request ${requestId}`,
        { model }
      );
      const newRoomId = await this.retryService.retryOperation(
        () => this.chatRoomService.createRoom(session.user.id, model),
        "room creation"
      );
      if (!newRoomId) {
        console.error("❌ [MessagePersistence] Failed to create chat room");
        throw new Error("Failed to create chat room");
      }
      roomId = newRoomId;
      isNewRoom = true;
      console.log(
        "✅ [MessagePersistence] Successfully created new room:",
        roomId
      );
      this.loggingService.info(
        `Room created successfully for request ${requestId}`,
        { roomId }
      );
    } else {
      console.log("✅ [MessagePersistence] Using existing room:", roomId);
    }

    return { roomId, isNewRoom };
  }
}
