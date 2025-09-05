import { IChatRoomService } from "@/entities/chatRoom";
import type { ChatMessage } from "@/entities/message";
import type { Session } from "@/entities/session";

import { getLogger } from "../../../../../shared/services/logger";
import { ROOM_NAME_MAX_LENGTH } from "../../../constants";
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

  private logger = getLogger("MessagePersistence");

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

    try {
      // Handle database operations
      if (regenerateIndex !== undefined) {
        if (originalAssistantContent) {
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
        }
      } else {
        // Insert messages on the client for both new and existing rooms
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
      }

      // Update room metadata (non-critical operation)
      try {
        await this.chatRoomService.updateRoom(roomId, {
          name: userMsg.content.slice(0, ROOM_NAME_MAX_LENGTH),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        // Room update is not critical - log but don't fail the entire operation
        this.logger.warn("Room update failed but continuing", { error });
        this.loggingService.warn(
          `Room update failed for request ${requestId}, but continuing`,
          { error }
        );
      }

      this.loggingService.info(
        `Persistence completed for request ${requestId}`
      );
    } catch (error) {
      this.logger.error("Persistence failed", { error });
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

    if (!roomId) {
      const newRoomId = await this.retryService.retryOperation(
        () => this.chatRoomService.createRoom(session.user.id, model),
        "room creation"
      );
      if (!newRoomId) {
        this.logger.error("Failed to create chat room");
        throw new Error("Failed to create chat room");
      }
      roomId = newRoomId;
      isNewRoom = true;
    } else {
    }

    return { roomId, isNewRoom };
  }
}
