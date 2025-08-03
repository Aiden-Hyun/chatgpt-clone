// src/features/chat/services/core/MessageSenderService.ts
import { Session } from '@supabase/supabase-js';
import { IAIApiService } from '../interfaces/IAIApiService';
import { IChatRoomService } from '../interfaces/IChatRoomService';
import { IMessageService } from '../interfaces/IMessageService';
import { INavigationService } from '../interfaces/INavigationService';
import { IStorageService } from '../interfaces/IStorageService';
import { IUIStateService } from '../interfaces/IUIStateService';
import { AIApiRequest, ChatMessage } from '../types';
import { IAIResponseProcessor } from './AIResponseProcessor';
import { LoggingService } from './LoggingService';
import { RetryService } from './RetryService';

export interface SendMessageRequest {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  model: string;
  regenerateIndex?: number;
  originalAssistantContent?: string;
  session: Session;
}

export interface SendMessageResult {
  success: boolean;
  roomId?: number;
  error?: string;
  duration?: number;
}

export class MessageSenderService {
  private readonly retryService: RetryService;
  private readonly loggingService: LoggingService;

  constructor(
    private chatRoomService: IChatRoomService,
    private messageService: IMessageService,
    private aiApiService: IAIApiService,
    private storageService: IStorageService,
    private navigationService: INavigationService,
    private uiStateService: IUIStateService,
    private responseProcessor: IAIResponseProcessor
  ) {
    this.retryService = new RetryService({ maxRetries: 3, retryDelay: 1000, exponentialBackoff: true });
    this.loggingService = new LoggingService('MessageSenderService');
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    try {
      this.loggingService.info(`Starting message send request ${requestId}`, {
        requestId,
        roomId: request.numericRoomId,
        model: request.model,
        regenerateIndex: request.regenerateIndex,
        messageCount: request.messages.length
      });

      const { userContent, numericRoomId, messages, model, regenerateIndex, originalAssistantContent, session } = request;

      // Create user and assistant message objects
      const userMsg: ChatMessage = { role: 'user', content: userContent };
      const assistantMsg: ChatMessage = { role: 'assistant', content: '' };

      // Step 1: Update UI state for new messages or regeneration
      this.loggingService.debug(`Updating UI state for request ${requestId}`, { regenerateIndex });
      this.uiStateService.updateMessageState({ regenerateIndex, userMsg, assistantMsg });
      this.uiStateService.setTyping(true);

      // Step 2: Prepare for room creation (but don't create yet)
      let roomId = numericRoomId;
      let isNewRoom = false;
      
      if (!roomId) {
        this.loggingService.info(`Will create new room after successful AI response for request ${requestId}`, { model });
        isNewRoom = true;
      }

      // Step 3: Prepare messages for AI API
      const currentMessages = regenerateIndex !== undefined 
        ? messages 
        : [...messages, userMsg];
      
      const apiRequest: AIApiRequest = {
        roomId,
        messages: currentMessages,
        model,
      };

      this.loggingService.debug(`Sending AI API request ${requestId}`, {
        messageCount: currentMessages.length,
        model
      });

      // Step 4: Get response from AI API with retry
      const apiResponse = await this.retryService.retryOperation(
        () => this.aiApiService.sendMessage(apiRequest, session.access_token),
        'AI API call'
      );
      
      if (!this.responseProcessor.validateResponse(apiResponse)) {
        const error = 'Invalid AI response';
        this.loggingService.error(`Invalid AI response for request ${requestId}`, { error, response: apiResponse });
        this.uiStateService.addErrorMessage('⚠️ No valid response received from AI.');
        this.uiStateService.setTyping(false);
        return { success: false, error, duration: Date.now() - startTime };
      }

      const fullContent = this.responseProcessor.extractContent(apiResponse);
      if (!fullContent) {
        const error = 'No content in AI response';
        this.loggingService.error(`No content in AI response for request ${requestId}`, { error });
        this.uiStateService.addErrorMessage('⚠️ No content received from AI.');
        this.uiStateService.setTyping(false);
        return { success: false, error, duration: Date.now() - startTime };
      }

      this.loggingService.info(`AI response received for request ${requestId}`, {
        contentLength: fullContent.length,
        model: apiResponse.model
      });

      // Step 5: Animate the response and handle database operations after completion
      this.uiStateService.animateResponse({
        fullContent,
        regenerateIndex,
        onComplete: async () => {
          try {
            this.loggingService.debug(`Starting post-animation operations for request ${requestId}`);
            
            // Handle database operations
            if (regenerateIndex !== undefined) {
              if (originalAssistantContent) {
                this.loggingService.debug(`Updating regenerated message for request ${requestId}`, { regenerateIndex });
                await this.retryService.retryOperation(
                  () => this.messageService.updateAssistantMessage({
                    roomId,
                    newContent: fullContent,
                    originalContent: originalAssistantContent,
                    session,
                  }),
                  'message update'
                );
              }
            } else {
              // For new messages, create room first if it's a new room
              if (isNewRoom) {
                this.loggingService.debug(`Creating new room for request ${requestId}`, { model });
                const newRoomId = await this.retryService.retryOperation(
                  () => this.chatRoomService.createRoom(session.user.id, model),
                  'room creation'
                );
                
                if (!newRoomId) {
                  throw new Error('Failed to create chat room');
                }
                
                roomId = newRoomId;
                this.loggingService.info(`Room created successfully for request ${requestId}`, { roomId });
              }

              this.loggingService.debug(`Inserting new messages for request ${requestId}`);
              await this.retryService.retryOperation(
                () => this.messageService.insertMessages({
                  roomId,
                  userMessage: userMsg,
                  assistantMessage: { role: 'assistant', content: fullContent },
                  session,
                }),
                'message insertion'
              );
            }

            // Update room metadata (non-critical operation)
            this.loggingService.debug(`Updating room metadata for request ${requestId}`, { roomId });
            try {
              await this.chatRoomService.updateRoom(roomId, {
                name: userMsg.content.slice(0, 100),
                updatedAt: new Date().toISOString(),
              });
            } catch (error) {
              // Room update is not critical - log but don't fail the entire operation
              this.loggingService.warn(`Room update failed for request ${requestId}, but continuing`, { error });
            }

            // Clean up drafts
            this.uiStateService.cleanupDrafts({ isNewRoom, roomId });

            // Handle navigation for new rooms
            if (isNewRoom) {
              this.loggingService.info(`Handling navigation for new room ${requestId}`, { roomId });
              await this.navigationService.handleNewRoomNavigation(roomId, userMsg, fullContent, model);
            }

            this.loggingService.info(`Post-animation operations completed for request ${requestId}`);
          } catch (error) {
            this.loggingService.error(`Error in post-animation operations for request ${requestId}`, { error });
          }
        }
      });

      const duration = Date.now() - startTime;
      this.loggingService.info(`Message send completed successfully for request ${requestId}`, {
        duration,
        roomId,
        isNewRoom
      });

      return { success: true, roomId, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      this.loggingService.error(`Message send failed for request ${requestId}`, {
        error: errorMessage,
        duration,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      this.uiStateService.addErrorMessage('⚠️ Error contacting AI.');
      this.uiStateService.setTyping(false);
      return { success: false, error: errorMessage, duration };
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 