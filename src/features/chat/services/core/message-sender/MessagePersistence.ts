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

    this.logger.debug("Starting message persistence for request", {
      requestId,
      roomId,
      regenerateIndex,
      contentLength: fullContent.length,
    });

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
        this.logger.debug("Processing regeneration for index", {
          regenerateIndex,
        });
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
          this.logger.debug("Successfully updated regenerated message");
        }
      } else {
        // Insert messages on the client for both new and existing rooms
        this.logger.debug("Inserting new messages for room", { roomId });
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
        this.logger.debug("Successfully inserted new messages");
      }

      // Update room metadata (non-critical operation)
      this.logger.debug("Updating room metadata for room", { roomId });
      this.loggingService.debug(
        `Updating room metadata for request ${requestId}`,
        { roomId }
      );
      try {
        await this.chatRoomService.updateRoom(roomId, {
          name: userMsg.content.slice(0, ROOM_NAME_MAX_LENGTH),
          updatedAt: new Date().toISOString(),
        });
        this.logger.debug("Successfully updated room metadata");
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
      this.logger.debug("All persistence operations completed successfully");
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

    this.logger.debug("Checking if room creation is needed", {
      numericRoomId,
      model,
    });

    if (!roomId) {
      this.logger.debug("Creating new room for model", { model });
      this.loggingService.info(
        `Creating new room up front for request ${requestId}`,
        { model }
      );
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
      this.logger.debug("Successfully created new room", { roomId });
      this.loggingService.info(
        `Room created successfully for request ${requestId}`,
        { roomId }
      );
    } else {
      this.logger.debug("Using existing room", { roomId });
    }

    return { roomId, isNewRoom };
  }
}
