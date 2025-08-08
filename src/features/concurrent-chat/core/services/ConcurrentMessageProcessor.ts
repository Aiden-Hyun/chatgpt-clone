import { ServiceContainer } from '../container/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { MESSAGE_EVENT_TYPES } from '../types/events/MessageEvents';
import { IAIService } from '../types/interfaces/IAIService';
import { ConcurrentMessage, IMessageProcessor } from '../types/interfaces/IMessageProcessor';

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
          console.log('[MODEL] Processor → resolved model', { modelToUse, roomId: message.roomId });
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
        console.log('[AI] Processor → request context size', history.length);

        // Create AI request
        const request = {
          messages: history,
          model: modelToUse || 'gpt-3.5-turbo',
          temperature: 0.7,
          max_tokens: 1000,
        };

        

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

        // Publish assistant message started event (for animation)
        this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_SENT, {
          type: MESSAGE_EVENT_TYPES.MESSAGE_SENT,
          timestamp: Date.now(),
          messageId: assistantMessage.id,
          message: assistantMessage,
        });

        // Call AI service (this will take time, showing animation)
        const aiResponse = await aiService.sendMessage(request, session);
        
        
        const assistantContent = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

        // Update assistant message with content and completed status
        const completedAssistantMessage: ConcurrentMessage = {
          ...assistantMessage,
          content: assistantContent,
          status: 'completed',
        };

        // Publish assistant message completed event
        this.eventBus.publish(MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED, {
          type: MESSAGE_EVENT_TYPES.MESSAGE_COMPLETED,
          timestamp: Date.now(),
          messageId: completedAssistantMessage.id,
          message: completedAssistantMessage,
        });

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