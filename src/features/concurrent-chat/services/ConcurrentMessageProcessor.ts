import { GLOBAL_EVENT_TYPES, GlobalEvents } from '../../../shared/lib/globalEvents';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { EventBus } from '../core/events/EventBus';
import { MESSAGE_EVENT_TYPES } from '../core/types/events/MessageEvents';
import { IAIService, ConcurrentMessage, IMessageProcessor } from '../core/types';

/**
 * ConcurrentMessageProcessor - Real implementation of IMessageProcessor
 * 
 * This processor handles the full AI conversation flow:
 * 1. Receives user message
 * 2. Calls AI service to get response
 * 3. Creates assistant response message
 * 4. Publishes events for UI updates
 */
export class ConcurrentMessageProcessor implements IMessageProcessor {
  constructor(
    private eventBus: EventBus,
    private serviceContainer: ServiceContainer
  ) {
    if (!eventBus) {
      throw new Error('EventBus is required');
    }
    if (!serviceContainer) {
      throw new Error('ServiceContainer is required');
    }
  }

  async process(message: ConcurrentMessage): Promise<ConcurrentMessage> {
    
    
    if (!message || !message.content) {
      throw new Error('Invalid message');
    }

    try {
      // Publish message sent event (user message completed)
      
      this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_SENT, {
        type: MESSAGE_EVENT_TYPES.MESSAGE_SENT,
        timestamp: Date.now(),
        messageId: message.id,
        message: { ...message, status: 'completed' },
      });

      // For user messages, just mark as completed and get AI response
      if (message.role === 'user') {
        // Get AI service and session
        
        const aiService = this.serviceContainer.get<IAIService>('aiService');
        const session = this.serviceContainer.get('session');

        if (!aiService) {
          throw new Error('AI service not available');
        }
        if (!session) {
          throw new Error('No active session');
        }

        

        // Resolve current model from selector if not carried on message
        let modelToUse = message.model;
        try {
          const selector = this.serviceContainer.get<any>('modelSelector');
          if (!modelToUse) {
            modelToUse = message.roomId ? await selector.getModelForRoom(message.roomId) : selector.getCurrentModel();
          }
          // Re-fetch just before request to avoid race with recent selection
          if (message.roomId) {
            const fresh = await selector.getModelForRoom(message.roomId);
            if (fresh) modelToUse = fresh;
          }
          try { console.log('[MODEL] Processor→resolved', { modelToUse, roomId: message.roomId }); } catch {}
        } catch {}

        // Build conversation history from metadata.context or fallback to minimal
        const history: Array<{ role: string; content: string }> = [];
        const contextFromMetadata = (message as any).metadata?.context as ConcurrentMessage[] | undefined;
        if (Array.isArray(contextFromMetadata)) {
          for (const m of contextFromMetadata) {
            history.push({ role: m.role, content: m.content });
          }
        }
        // Always include the current user turn last
        history.push({ role: message.role, content: message.content });
        try { console.log('[AI] ctx', history.length); } catch {}

        // Create AI request
        const request = {
          messages: history,
          model: modelToUse || 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
        };
        try { console.log('[MODEL] Processor→using', request.model); } catch {}

        

        // Create assistant message with processing status (for animation)
        const assistantMessage: ConcurrentMessage = {
          id: `assistant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          content: '', // Empty content for loading animation
          role: 'assistant',
          status: 'processing', // Processing status for animation
          timestamp: Date.now(),
          roomId: message.roomId,
          model: modelToUse,
        };

        // Publish assistant message started event (for loading/processing)
        this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_SENT, {
          type: MESSAGE_EVENT_TYPES.MESSAGE_SENT,
          timestamp: Date.now(),
          messageId: assistantMessage.id,
          message: assistantMessage,
        });

        // Call AI service (this will take time, showing animation)
        let aiResponse;
        try {
          aiResponse = await aiService.sendMessage(request, session);
        } catch (err) {
          if (err instanceof Error && err.message === 'UNSUPPORTED_MODEL') {
            // Inform user in their language via a friendly assistant message
            const unsupportedMsg: ConcurrentMessage = {
              ...assistantMessage,
              content: 'This model is not available. Please choose another model.',
              status: 'completed',
            };
            this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED, {
              type: MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED,
              timestamp: Date.now(),
              messageId: unsupportedMsg.id,
              message: unsupportedMsg,
            });
            return unsupportedMsg;
          }
          throw err;
        }
        
        
        const assistantContent = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        // Update assistant message with content and completed status
        const completedAssistantMessage: ConcurrentMessage = {
          ...assistantMessage,
          content: assistantContent,
          status: 'completed',
        };

        // Publish assistant message completed event (UI will detect processing→completed)
        this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED, {
          type: MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED,
          timestamp: Date.now(),
          messageId: completedAssistantMessage.id,
          message: completedAssistantMessage,
        });
        try { console.log('[ANIM] complete-publish'); } catch {}

        // Persist turn(s)
        if (!message.roomId) {
          // First turn for a new chat
          try {
            const persistence = this.serviceContainer.get<any>('persistenceService');
            // If pre-created by UI, prefer that id
            const preId = (this.serviceContainer as any).get?.('activeRoomId');
            const roomId = await persistence.persistFirstTurn({
              session,
              model: request.model,
              numericRoomId: preId ?? null,
              userContent: message.content,
              assistantContent: assistantContent,
            });
            this.eventBus.publish(MESSAGE_EVENT_TYPES.ROOM_CREATED, {
              type: MESSAGE_EVENT_TYPES.ROOM_CREATED,
              timestamp: Date.now(),
              roomId,
            } as any);
            // Also emit app-wide event so sidebar can react without Realtime
            GlobalEvents.emit(GLOBAL_EVENT_TYPES.ROOMS_CREATED, { roomId });
          } catch {}
        } else {
          // Existing room: append both user and assistant messages
          try {
            const persistence = this.serviceContainer.get<any>('persistenceService');
            await persistence.persistTurn({
              session,
              roomId: message.roomId,
              userContent: message.content,
              assistantContent: assistantContent,
            });
          } catch {}
        }

        return completedAssistantMessage;
      }

      // For non-user messages, just return as completed
      return { ...message, status: 'completed' };
    } catch (error) {
      // Mark message as failed
      const failedMessage = { ...message, status: 'failed' as const };
      
      this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_FAILED, {
        type: MESSAGE_EVENT_TYPES.MESSAGE_FAILED,
        timestamp: Date.now(),
        messageId: message.id,
        message: failedMessage,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }
}