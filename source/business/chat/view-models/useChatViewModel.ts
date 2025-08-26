import { useState, useCallback } from 'react';
import { MessageEntity } from '../entities/Message';
import { ChatRoomEntity } from '../entities/ChatRoom';
import { SendMessageUseCase } from '../use-cases/SendMessageUseCase';
import { ReceiveMessageUseCase } from '../use-cases/ReceiveMessageUseCase';
import { DeleteMessageUseCase } from '../use-cases/DeleteMessageUseCase';
import { CopyMessageUseCase } from '../use-cases/CopyMessageUseCase';
import { MessageRepository } from '../../../persistence/chat/repositories/MessageRepository';
import { ChatRoomRepository } from '../../../persistence/chat/repositories/ChatRoomRepository';
import { AIProvider } from '../../../persistence/chat/adapters/AIProvider';
import { ClipboardAdapter } from '../../../persistence/chat/adapters/ClipboardAdapter';
import { MessageValidator } from '../../../service/chat/validators/MessageValidator';
import { IdGenerator } from '../../../service/chat/generators/IdGenerator';
import { Logger } from '../../../service/shared/utils/Logger';

export interface ChatState {
  messages: MessageEntity[];
  currentRoom: ChatRoomEntity | null;
  isLoading: boolean;
  error: string | null;
  inputValue: string;
}

export interface ChatActions {
  sendMessage: (content: string, model?: string) => Promise<void>;
  receiveMessage: (context?: string, model?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  setInputValue: (value: string) => void;
  clearError: () => void;
  loadMessages: (roomId: string) => Promise<void>;
}

export function useChatViewModel(userId: string): ChatState & ChatActions {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentRoom: null,
    isLoading: false,
    error: null,
    inputValue: ''
  });

  // Initialize dependencies
  const messageRepository = new MessageRepository();
  const chatRoomRepository = new ChatRoomRepository();
  const aiProvider = new AIProvider();
  const clipboardAdapter = new ClipboardAdapter();
  const messageValidator = new MessageValidator();
  const idGenerator = new IdGenerator();
  const logger = new Logger();

  // Initialize use cases
  const sendMessageUseCase = new SendMessageUseCase(
    messageRepository,
    chatRoomRepository,
    aiProvider,
    messageValidator,
    idGenerator,
    logger
  );

  const receiveMessageUseCase = new ReceiveMessageUseCase(
    messageRepository,
    aiProvider,
    idGenerator,
    logger
  );

  const deleteMessageUseCase = new DeleteMessageUseCase(
    messageRepository,
    logger
  );

  const copyMessageUseCase = new CopyMessageUseCase(
    messageRepository,
    clipboardAdapter,
    logger
  );

  const sendMessage = useCallback(async (content: string, model?: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await sendMessageUseCase.execute({
        content,
        roomId: state.currentRoom.id,
        userId,
        model
      });

      if (result.success && result.userMessage && result.assistantMessage) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, result.userMessage, result.assistantMessage],
          inputValue: '',
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to send message',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to send message',
        isLoading: false
      }));
    }
  }, [state.currentRoom, userId]);

  const receiveMessage = useCallback(async (context?: string, model?: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const result = await receiveMessageUseCase.execute({
        roomId: state.currentRoom.id,
        userId,
        context,
        model
      });

      if (result.success && result.message) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, result.message!],
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to receive message',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to receive message',
        isLoading: false
      }));
    }
  }, [state.currentRoom, userId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    try {
      const result = await deleteMessageUseCase.execute({
        messageId,
        userId,
        roomId: state.currentRoom.id
      });

      if (result.success && result.message) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? result.message! : msg
          )
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to delete message'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to delete message'
      }));
    }
  }, [state.currentRoom, userId]);

  const copyMessage = useCallback(async (messageId: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    try {
      const result = await copyMessageUseCase.execute({
        messageId,
        userId,
        roomId: state.currentRoom.id
      });

      if (!result.success) {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to copy message'
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to copy message'
      }));
    }
  }, [state.currentRoom, userId]);

  const setInputValue = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const room = await chatRoomRepository.getById(roomId);
      const messages = await messageRepository.getByRoomId(roomId);

      if (room && room.userId === userId) {
        setState(prev => ({
          ...prev,
          currentRoom: room,
          messages,
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: 'Chat room not found or access denied',
          isLoading: false
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to load messages',
        isLoading: false
      }));
    }
  }, [userId]);

  return {
    ...state,
    sendMessage,
    receiveMessage,
    deleteMessage,
    copyMessage,
    setInputValue,
    clearError,
    loadMessages
  };
}
