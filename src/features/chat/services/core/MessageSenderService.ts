// src/features/chat/services/core/MessageSenderService.ts
import { Session } from '@supabase/supabase-js';
import {
  DEFAULT_RETRY_DELAY_MS,
  MESSAGE_SEND_MAX_RETRIES,
  ROOM_NAME_MAX_LENGTH,
} from '../../constants';
import { getModelInfo } from '../../constants/models';
import { ChatMessage } from '../../types';
import { generateMessageId } from '../../utils/messageIdGenerator';
import { IAIApiService } from '../interfaces/IAIApiService';
import { IAnimationService } from '../interfaces/IAnimationService';
import { IChatRoomService } from '../interfaces/IChatRoomService';
import { IMessageService } from '../interfaces/IMessageService';
import { IMessageStateService } from '../interfaces/IMessageStateService';
import { INavigationService } from '../interfaces/INavigationService';

import { ITypingStateService } from '../interfaces/ITypingStateService';
import { AIApiRequest } from '../types';
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
  // ✅ Phase 2: Add message ID tracking
  messageId?: string;
  // Search mode support
  isSearchMode?: boolean;
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
    private navigationService: INavigationService,
    private responseProcessor: IAIResponseProcessor,
    private messageStateService: IMessageStateService,
    private typingStateService: ITypingStateService,
    private animationService: IAnimationService,

  ) {
    this.retryService = new RetryService({
      maxRetries: MESSAGE_SEND_MAX_RETRIES,
      retryDelay: DEFAULT_RETRY_DELAY_MS,
      exponentialBackoff: true,
    });
    this.loggingService = new LoggingService('MessageSenderService');
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;
    
    try {
      console.log('🔍 [MessageSenderService] Starting message send with isSearchMode:', request.isSearchMode);
      this.loggingService.info(`Starting message send request ${requestId}`, {
        requestId,
        messageId: request.messageId, // ✅ Phase 2: Log message ID
        roomId: request.numericRoomId,
        model: request.model,
        regenerateIndex: request.regenerateIndex,
        messageCount: request.messages.length,

      });

      const { userContent, numericRoomId, messages, model, regenerateIndex, originalAssistantContent, session, messageId, isSearchMode } = request;

      // Validate search mode is supported for this model
      if (isSearchMode) {
        const modelInfo = getModelInfo(model);
        if (!modelInfo?.capabilities.search) {
          const error = `Search is not supported for model: ${model}`;
          this.loggingService.error(`Search validation failed for request ${requestId}`, { error, model });
          return { success: false, error, duration: Date.now() - startTime };
        }
      }

      // Create user and assistant message objects
      const userMsg: ChatMessage = { 
        role: 'user', 
        content: userContent,
        state: 'completed',           // User messages are immediately completed
        id: generateMessageId()
      };
      const assistantMsg: ChatMessage = { 
        role: 'assistant', 
        content: '', 
        state: 'loading',           // Start in loading state
        id: messageId || generateMessageId()     // Use provided ID or generate new one
      };
      assistantMessageIdForError = assistantMsg.id ?? null;

      // Step 1: Update UI state for new messages or regeneration
      this.loggingService.debug(`Updating UI state for request ${requestId}`, { 
        regenerateIndex, 
        messageId // ✅ Phase 2: Include message ID in logging
      });
      
      this.messageStateService.updateMessageState({ 
        regenerateIndex, 
        userMsg, 
        assistantMsg, 
        messageId
      });
      // Only set typing for new messages, not for regeneration
      if (regenerateIndex === undefined) {
        this.typingStateService.setTyping(true);
      }

      // Step 2: Ensure room exists up front (no optimistic temp room)
      let roomId = numericRoomId;
      let isNewRoom = false;
      if (!roomId) {
        this.loggingService.info(`Creating new room up front for request ${requestId}`, { model });
        const newRoomId = await this.retryService.retryOperation(
          () => this.chatRoomService.createRoom(session.user.id, model),
          'room creation'
        );
        if (!newRoomId) {
          throw new Error('Failed to create chat room');
        }
        roomId = newRoomId;
        isNewRoom = true;
        this.loggingService.info(`Room created successfully for request ${requestId}`, { roomId });
      }



      // Step 4: Prepare messages for AI API (search will be handled on server-side)
      const messagesWithSearch = regenerateIndex !== undefined 
        ? messages 
        : [...messages, userMsg];
      
      console.log('🔍 [MessageSenderService] Preparing AI request:', {
        messageCount: messagesWithSearch.length
      });
      
      const apiRequest: AIApiRequest = {
        roomId,
        messages: messagesWithSearch,
        model,
        clientMessageId: assistantMsg.id,
        // Always handle persistence on the client to avoid relying on edge upsert
        // This prevents missing rows if the edge function cannot upsert
        skipPersistence: true,

      };

      this.loggingService.debug(`Sending AI API request ${requestId}`, {
        messageCount: messagesWithSearch.length,
        model,

      });

      // Step 5: Get response from AI API with retry
      const apiResponse = await this.retryService.retryOperation(
        () => this.aiApiService.sendMessage(apiRequest, session.access_token, isSearchMode),
        'AI API call'
      );
      
      if (!this.responseProcessor.validateResponse(apiResponse)) {
        const error = 'Invalid AI response';
        this.loggingService.error(`Invalid AI response for request ${requestId}`, { error, response: apiResponse });
        // Update the existing assistant bubble instead of adding a new error message
        this.messageStateService.markMessageErrorById(assistantMsg.id || generateMessageId(), '⚠️ No valid response received from AI.');
      this.typingStateService.setTyping(false);
        return { success: false, error, duration: Date.now() - startTime };
      }

      const fullContent = this.responseProcessor.extractContent(apiResponse);
      if (!fullContent) {
        const error = 'No content in AI response';
        this.loggingService.error(`No content in AI response for request ${requestId}`, { error });
        // Update the existing assistant bubble instead of adding a new error message
        this.messageStateService.markMessageErrorById(assistantMsg.id || generateMessageId(), '⚠️ No content received from AI.');
      this.typingStateService.setTyping(false);
        return { success: false, error, duration: Date.now() - startTime };
      }

      this.loggingService.info(`AI response received for request ${requestId}`, {
        contentLength: fullContent.length,
        model: apiResponse.model
      });

      // Step 6: Animate the response and handle database operations after completion
      this.loggingService.debug(`Starting animation for request ${requestId}`, { 
        messageId, 
        regenerateIndex,
        contentLength: fullContent.length 
      });
      
      // DISABLED: Legacy animation system causing infinite loops
      // Using new TypewriterText component instead for animation
      // But we still need to update the message state immediately
      
      // Set full content and transition to animating state
      this.animationService.setMessageFullContentAndAnimate({
        fullContent,
        regenerateIndex,
        messageId: assistantMsg.id
      });
      
      // Directly call the completion logic without legacy animation
      (async () => {
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
              // Insert messages on the client for both new and existing rooms
              this.loggingService.debug(`Inserting messages for request ${requestId}`);
              await this.retryService.retryOperation(
                () => this.messageService.insertMessages({
                  roomId,
                  userMessage: userMsg,
                  assistantMessage: { role: 'assistant', content: fullContent, id: assistantMsg.id },
                  session,
                }),
                'message insertion'
              );
            }

            // Update room metadata (non-critical operation)
            this.loggingService.debug(`Updating room metadata for request ${requestId}`, { roomId });
            try {
              await this.chatRoomService.updateRoom(roomId, {
                name: userMsg.content.slice(0, ROOM_NAME_MAX_LENGTH),
                updatedAt: new Date().toISOString(),
              });
            } catch (error) {
              // Room update is not critical - log but don't fail the entire operation
              this.loggingService.warn(`Room update failed for request ${requestId}, but continuing`, { error });
            }

            // Draft cleanup is handled by useMessageInput via storage and local state
            // No additional navigation is required; room was created up front and user is already on the room screen

            this.loggingService.info(`Post-animation operations completed for request ${requestId}`);
          } catch (error) {
            this.loggingService.error(`Error in post-animation operations for request ${requestId}`, { error });
          }
        })(); // Immediately execute the async function
      // }); // End of disabled animateResponse

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
      
      // Update the existing assistant bubble instead of adding a new error message
      if (assistantMessageIdForError) {
        this.messageStateService.markMessageErrorById(
          assistantMessageIdForError,
          error instanceof Error && (error as any).name === 'TimeoutError'
            ? '⚠️ Request timed out. Please try again.'
            : '⚠️ Error contacting AI.'
        );
      } else {
        // Fallback: mark the last assistant loading bubble as error if id not available
        this.messageStateService.markLastAssistantLoadingAsError(
          error instanceof Error && (error as any).name === 'TimeoutError'
            ? '⚠️ Request timed out. Please try again.'
            : '⚠️ Error contacting AI.'
        );
      }
      return { success: false, error: errorMessage, duration };
    } finally {
      // Always clear typing state when operation completes or fails
      this.typingStateService.setTyping(false);
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
} 