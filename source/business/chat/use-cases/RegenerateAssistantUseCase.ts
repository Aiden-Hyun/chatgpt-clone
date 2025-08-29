import { IIdGenerator } from '../../../service/chat/interfaces/IIdGenerator';
import { ILogger } from '../../../service/shared/interfaces/ILogger';
import { IUserSession } from '../../interfaces';
import { MessageEntity, MessageRole } from '../../interfaces';
import { IAIProvider } from '../../interfaces';
import { IChatRoomRepository } from '../../interfaces';
import { IMessageRepository } from '../../interfaces';



export class RegenerateAssistantUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private chatRoomRepository: IChatRoomRepository,
    private aiProvider: IAIProvider,
    private idGenerator: IIdGenerator,
    private logger: ILogger
  ) {}

  async execute(params: RegenerateAssistantParams): Promise<RegenerateAssistantResult> {
    try {
      this.logger.info('RegenerateAssistantUseCase: Starting regeneration', { 
        targetId: params.targetId 
      });

      // Resolve the target user message
      const { userMessage, existingAssistantMessage } = await this.resolveTargetUserMessage(
        params.targetId, 
        params.session
      );

      if (!userMessage) {
        return {
          success: false,
          error: 'Could not find target user message'
        };
      }

      // Verify user owns the message and has room access
      if (userMessage.userId !== params.session.user.id) {
        return {
          success: false,
          error: 'Can only regenerate responses to your own messages'
        };
      }

      const room = await this.chatRoomRepository.getById(userMessage.roomId, params.session);
      if (!room || room.userId !== params.session.user.id) {
        return {
          success: false,
          error: 'Access denied to this chat room'
        };
      }

      // Build context up to the target user message
      const context = await this.buildContextUpToMessage(
        userMessage.roomId, 
        userMessage.id, 
        params.session
      );

      // Get AI response
      const aiResponse = await this.aiProvider.sendMessage({
        content: context,
        roomId: userMessage.roomId,
        model: params.model || 'gpt-3.5-turbo',
        accessToken: params.accessToken
      });

      if (!aiResponse.success) {
        return {
          success: false,
          error: aiResponse.error || 'Failed to get AI response'
        };
      }

      // Create new assistant message
      const newAssistantMessage = new MessageEntity({
        id: this.idGenerator.generateMessageId(),
        content: aiResponse.content,
        role: MessageRole.ASSISTANT,
        roomId: userMessage.roomId,
        metadata: {
          model: params.model || 'gpt-3.5-turbo',
          tokens: aiResponse.tokens,
          processingTime: aiResponse.processingTime,
          replyToMessageId: userMessage.id
        }
      });

      // Save new assistant message
      const saveResult = await this.messageRepository.save(newAssistantMessage, params.session);
      if (!saveResult.success) {
        return {
          success: false,
          error: saveResult.error || 'Failed to save new assistant message'
        };
      }

      // Mark existing assistant message as superseded if it exists
      if (existingAssistantMessage) {
        existingAssistantMessage.markAsSuperseded(newAssistantMessage.id);
        await this.messageRepository.update(existingAssistantMessage, params.session);
      }

      // Update room with new message
      room.updateLastMessage(newAssistantMessage.id, newAssistantMessage.timestamp);
      await this.chatRoomRepository.update(room, params.session);

      this.logger.info('RegenerateAssistantUseCase: Regeneration completed successfully', {
        targetId: params.targetId,
        newAssistantMessageId: newAssistantMessage.id,
        supersededMessageId: existingAssistantMessage?.id
      });

      return {
        success: true,
        newAssistantMessage,
        supersededMessage: existingAssistantMessage
      };

    } catch (error) {
      this.logger.error('RegenerateAssistantUseCase: Failed to regenerate', { 
        error, 
        targetId: params.targetId 
      });
      return {
        success: false,
        error: 'Failed to regenerate assistant response'
      };
    }
  }

  private async resolveTargetUserMessage(
    targetId: string, 
    session: Session
  ): Promise<{ userMessage: MessageEntity | null; existingAssistantMessage: MessageEntity | null }> {
    const targetMessage = await this.messageRepository.getById(targetId, session);
    
    if (!targetMessage) {
      return { userMessage: null, existingAssistantMessage: null };
    }

    if (targetMessage.isUserMessage()) {
      // Target is already a user message
      // Look for existing assistant response
      const existingAssistant = await this.findAssistantReplyToUserMessage(targetMessage.id, session);
      return { userMessage: targetMessage, existingAssistantMessage: existingAssistant };
    }

    if (targetMessage.isAssistantMessage()) {
      // Target is an assistant message, find the user message it replied to
      const replyToMessageId = targetMessage.metadata?.replyToMessageId;
      if (replyToMessageId) {
        const userMessage = await this.messageRepository.getById(replyToMessageId, session);
        return { userMessage, existingAssistantMessage: targetMessage };
      }

      // Fallback: find the preceding user message in the room
      const userMessage = await this.findPrecedingUserMessage(targetMessage, session);
      return { userMessage, existingAssistantMessage: targetMessage };
    }

    return { userMessage: null, existingAssistantMessage: null };
  }

  private async findAssistantReplyToUserMessage(
    userMessageId: string, 
    session: Session
  ): Promise<MessageEntity | null> {
    const userMessage = await this.messageRepository.getById(userMessageId, session);
    if (!userMessage) return null;

    const roomMessages = await this.messageRepository.getByRoomId(userMessage.roomId, session);
    
    // Look for assistant message with replyToMessageId pointing to this user message
    return roomMessages.find(msg => 
      msg.isAssistantMessage() && 
      msg.metadata?.replyToMessageId === userMessageId &&
      !msg.isSuperseded()
    ) || null;
  }

  private async findPrecedingUserMessage(
    assistantMessage: MessageEntity, 
    session: Session
  ): Promise<MessageEntity | null> {
    const roomMessages = await this.messageRepository.getByRoomId(assistantMessage.roomId, session);
    
    // Sort messages by timestamp
    roomMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Find the assistant message index
    const assistantIndex = roomMessages.findIndex(msg => msg.id === assistantMessage.id);
    if (assistantIndex === -1) return null;

    // Look backwards for the most recent user message
    for (let i = assistantIndex - 1; i >= 0; i--) {
      if (roomMessages[i].isUserMessage() && !roomMessages[i].isDeleted) {
        return roomMessages[i];
      }
    }

    return null;
  }

  private async buildContextUpToMessage(roomId: string, untilMessageId: string, session: Session): Promise<string> {
    // Get all messages in the room
    const allMessages = await this.messageRepository.getByRoomId(roomId, session);
    
    // Find the index of the target message
    const targetIndex = allMessages.findIndex(msg => msg.id === untilMessageId);
    if (targetIndex === -1) {
      // If message not found, use recent messages as fallback
      const recentMessages = await this.messageRepository.getRecentByRoomId(roomId, 10, session);
      return recentMessages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');
    }

    // Include all messages up to and including the target message
    const contextMessages = allMessages
      .slice(0, targetIndex + 1)
      .filter(msg => !msg.isDeleted);

    if (contextMessages.length === 0) {
      return 'Hello! How can I help you today?';
    }

    return contextMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }
}
