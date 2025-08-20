import { DEFAULT_RETRY_DELAY_MS, MESSAGE_SEND_MAX_RETRIES } from '../../../constants';
import { IAIApiService } from '../../interfaces/IAIApiService';
import { IAIResponseProcessor } from '../AIResponseProcessor';
import { LoggingService } from '../LoggingService';
import { RetryService } from '../RetryService';
import { MessageAnimation } from './MessageAnimation';
import { MessageErrorHandler } from './MessageErrorHandler';
import { MessagePersistence } from './MessagePersistence';
import { MessageValidator, SendMessageRequest } from './MessageValidator';

export interface SendMessageResult {
  success: boolean;
  roomId?: number;
  error?: string;
  duration?: number;
}

export class MessageOrchestrator {
  private readonly retryService: RetryService;
  private readonly loggingService: LoggingService;
  private readonly validator: MessageValidator;
  private readonly persistence: MessagePersistence;
  private readonly animation: MessageAnimation;
  private readonly errorHandler: MessageErrorHandler;

  constructor(
    private aiApiService: IAIApiService,
    private responseProcessor: IAIResponseProcessor,
    chatRoomService: any,
    messageService: any,
    animationService: any,
    messageStateService: any,
    typingStateService: any
  ) {
    this.retryService = new RetryService({
      maxRetries: MESSAGE_SEND_MAX_RETRIES,
      retryDelay: DEFAULT_RETRY_DELAY_MS,
      exponentialBackoff: true,
    });
    this.loggingService = new LoggingService('MessageOrchestrator');
    
    this.validator = new MessageValidator();
    this.persistence = new MessagePersistence(chatRoomService, messageService);
    this.animation = new MessageAnimation(animationService, messageStateService, typingStateService);
    this.errorHandler = new MessageErrorHandler(messageStateService);
  }

  async sendMessage(request: SendMessageRequest): Promise<SendMessageResult> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    let assistantMessageIdForError: string | null = null;
    
    try {
      console.log('🔍 [MessageOrchestrator] Starting message send with isSearchMode:', request.isSearchMode);
      this.loggingService.info(`Starting message send request ${requestId}`, {
        requestId,
        messageId: request.messageId,
        roomId: request.numericRoomId,
        model: request.model,
        regenerateIndex: request.regenerateIndex,
        messageCount: request.messages.length,
      });

      // Step 1: Validate request and create message objects
      const validation = this.validator.validateRequest(request, requestId);
      if (!validation.isValid) {
        return { success: false, error: validation.error, duration: Date.now() - startTime };
      }

      const { userMsg, assistantMsg } = validation;
      assistantMessageIdForError = assistantMsg?.id ?? null;

      // Step 2: Update UI state
      this.animation.updateUIState({
        regenerateIndex: request.regenerateIndex,
        userMsg: userMsg!,
        assistantMsg: assistantMsg!,
        messageId: request.messageId,
        requestId
      });

      // Step 3: Ensure room exists
      const { roomId, isNewRoom } = await this.persistence.createRoomIfNeeded(
        request.numericRoomId,
        request.session,
        request.model,
        requestId
      );

      // Step 4: Prepare messages for AI API
      const messagesWithSearch = request.regenerateIndex !== undefined 
        ? request.messages 
        : [...request.messages, userMsg!];
      
      console.log('🔍 [MessageOrchestrator] Preparing AI request:', {
        messageCount: messagesWithSearch.length
      });
      
      const apiRequest = {
        roomId,
        messages: messagesWithSearch,
        model: request.model,
        clientMessageId: assistantMsg!.id,
        skipPersistence: true,
      };

      this.loggingService.debug(`Sending AI API request ${requestId}`, {
        messageCount: messagesWithSearch.length,
        model: request.model,
      });

      // Step 5: Get response from AI API with retry
      const apiResponse = await this.retryService.retryOperation(
        () => this.aiApiService.sendMessage(apiRequest, request.session.access_token, request.isSearchMode),
        'AI API call'
      );
      
      if (!this.responseProcessor.validateResponse(apiResponse)) {
        const error = 'Invalid AI response';
        this.errorHandler.handleAIResponseError(requestId, assistantMsg!.id, 'No valid response received from AI.');
        return { success: false, error, duration: Date.now() - startTime };
      }

      const fullContent = this.responseProcessor.extractContent(apiResponse);
      if (!fullContent) {
        const error = 'No content in AI response';
        this.errorHandler.handleAIResponseError(requestId, assistantMsg!.id, 'No content received from AI.');
        return { success: false, error, duration: Date.now() - startTime };
      }

      this.loggingService.info(`AI response received for request ${requestId}`, {
        contentLength: fullContent.length,
        model: apiResponse.model
      });

      // Step 6: Animate the response
      this.animation.animateResponse({
        fullContent,
        regenerateIndex: request.regenerateIndex,
        messageId: assistantMsg!.id,
        requestId
      });
      
      // Step 7: Handle database operations asynchronously
      (async () => {
        try {
          this.loggingService.debug(`Starting post-animation operations for request ${requestId}`);
          
          await this.persistence.persistMessages({
            roomId,
            userMsg: userMsg!,
            assistantMsg: assistantMsg!,
            fullContent,
            regenerateIndex: request.regenerateIndex,
            originalAssistantContent: request.originalAssistantContent,
            session: request.session,
            requestId
          });

          this.loggingService.info(`Post-animation operations completed for request ${requestId}`);
        } catch (error) {
          this.loggingService.error(`Error in post-animation operations for request ${requestId}`, { error });
        }
      })();

      const duration = Date.now() - startTime;
      this.loggingService.info(`Message send completed successfully for request ${requestId}`, {
        duration,
        roomId,
        isNewRoom
      });

      return { success: true, roomId, duration };

    } catch (error) {
      const duration = Date.now() - startTime;
      
      this.errorHandler.handleError({
        requestId,
        assistantMessageId: assistantMessageIdForError,
        duration,
        error
      });
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        duration 
      };
    } finally {
      // Always clear typing state when operation completes or fails
      this.animation.clearTypingState();
    }
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
