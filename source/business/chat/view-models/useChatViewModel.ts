import { useCallback, useState } from 'react';
import { IUserSession } from '../../shared/interfaces/IUserSession';
import { ChatRoomEntity } from '../entities/ChatRoom';
import { MessageEntity } from '../entities/Message';
import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';
import { IMessageRepository } from '../interfaces/IMessageRepository';
import { CopyMessageUseCase } from '../use-cases/CopyMessageUseCase';
import { DeleteMessageUseCase } from '../use-cases/DeleteMessageUseCase';
import { EditMessageUseCase } from '../use-cases/EditMessageUseCase';
import { ReceiveMessageUseCase } from '../use-cases/ReceiveMessageUseCase';
import { RegenerateAssistantUseCase } from '../use-cases/RegenerateAssistantUseCase';
import { ResendMessageUseCase } from '../use-cases/ResendMessageUseCase';
import { SendMessageUseCase } from '../use-cases/SendMessageUseCase';

export interface ChatState {
  messages: MessageEntity[];
  currentRoom: ChatRoomEntity | null;
  isLoading: boolean;
  error: string | null;
  inputValue: string;
  pendingByMessageId: Record<string, boolean>;
}

export interface ChatActions {
  sendMessage: (content: string, model?: string) => Promise<void>;
  receiveMessage: (context?: string, model?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  copyMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  resendMessage: (userMessageId: string, model?: string) => Promise<void>;
  regenerateAssistant: (targetId: string, model?: string) => Promise<void>;
  setInputValue: (value: string) => void;
  clearError: () => void;
  loadMessages: (roomId: string) => Promise<void>;
}

interface ChatViewModelDependencies {
  sendMessageUseCase: SendMessageUseCase;
  receiveMessageUseCase: ReceiveMessageUseCase;
  deleteMessageUseCase: DeleteMessageUseCase;
  copyMessageUseCase: CopyMessageUseCase;
  editMessageUseCase: EditMessageUseCase;
  resendMessageUseCase: ResendMessageUseCase;
  regenerateAssistantUseCase: RegenerateAssistantUseCase;
  messageRepository: IMessageRepository;
  chatRoomRepository: IChatRoomRepository;
  getAccessToken: () => Promise<string | null>;
}

export function useChatViewModel(
  userId: string,
  dependencies: ChatViewModelDependencies,
  session: IUserSession | null
): ChatState & ChatActions {
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentRoom: null,
    isLoading: false,
    error: null,
    inputValue: '',
    pendingByMessageId: {}
  });

  // Destructure injected dependencies
  const {
    sendMessageUseCase,
    receiveMessageUseCase,
    deleteMessageUseCase,
    copyMessageUseCase,
    editMessageUseCase,
    resendMessageUseCase,
    regenerateAssistantUseCase,
    messageRepository,
    chatRoomRepository
  } = dependencies;

  const sendMessage = useCallback(async (content: string, model?: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const accessToken = await dependencies.getAccessToken();
      if (!accessToken) {
        setState(prev => ({ ...prev, error: 'Failed to get access token', isLoading: false }));
        return;
      }

      const result = await sendMessageUseCase.execute({
        content,
        roomId: state.currentRoom.id,
        userId,
        model,
        session,
        accessToken
      });

      console.log('[useChatViewModel] SendMessage result:', {
        success: result.success,
        hasUserMessage: !!result.userMessage,
        hasAssistantMessage: !!result.assistantMessage,
        error: result.error
      });

      if (result.success && result.userMessage && result.assistantMessage) {
        // Both user and assistant messages created successfully
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, result.userMessage, result.assistantMessage],
          inputValue: '',
          isLoading: false
        }));
      } else if (result.userMessage) {
        // User message was saved but AI failed - show user message and error
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, result.userMessage],
          inputValue: '',
          error: result.error || 'AI response failed',
          isLoading: false
        }));
      } else {
        // Complete failure
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
  }, [state.currentRoom, userId, session, dependencies]);

  const receiveMessage = useCallback(async (context?: string, model?: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (!session) {
        setState(prev => ({ ...prev, error: 'Authentication required', isLoading: false }));
        return;
      }

      const accessToken = await dependencies.getAccessToken();
      if (!accessToken) {
        setState(prev => ({ ...prev, error: 'Failed to get access token', isLoading: false }));
        return;
      }

      const result = await receiveMessageUseCase.execute({
        roomId: state.currentRoom.id,
        userId,
        context,
        model,
        session,
        accessToken
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
  }, [state.currentRoom, userId, session]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    try {
      const result = await deleteMessageUseCase.execute({
        messageId,
        userId,
        roomId: state.currentRoom.id,
        session
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
  }, [state.currentRoom, userId, session]);

  const copyMessage = useCallback(async (messageId: string) => {
    if (!state.currentRoom) {
      setState(prev => ({ ...prev, error: 'No active chat room' }));
      return;
    }

    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    try {
      const result = await copyMessageUseCase.execute({
        messageId,
        userId,
        roomId: state.currentRoom.id,
        session
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
  }, [state.currentRoom, userId, session]);

  const setInputValue = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadMessages = useCallback(async (roomId: string) => {
    console.log('[useChatViewModel] loadMessages called', { roomId, hasSession: !!session, userId });
    
    if (!session) {
      console.log('[useChatViewModel] No session, setting auth error');
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      console.log('[useChatViewModel] Loading room and messages...');
      const room = await chatRoomRepository.getById(roomId, session);
      console.log('[useChatViewModel] Room loaded:', room);
      
      const messages = await messageRepository.getByRoomId(roomId, session);
      console.log('[useChatViewModel] Messages loaded:', messages?.length || 0, 'messages');

      if (room && room.userId === userId) {
        console.log('[useChatViewModel] Setting room and messages in state');
        setState(prev => ({
          ...prev,
          currentRoom: room,
          messages,
          isLoading: false
        }));
      } else {
        console.log('[useChatViewModel] Room access denied or not found', { room, userId });
        setState(prev => ({
          ...prev,
          error: 'Chat room not found or access denied',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('[useChatViewModel] Error loading messages:', error);
      setState(prev => ({
        ...prev,
        error: 'Failed to load messages',
        isLoading: false
      }));
    }
  }, [userId, session, chatRoomRepository, messageRepository]);

  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      pendingByMessageId: { ...prev.pendingByMessageId, [messageId]: true },
      error: null 
    }));

    try {
      const result = await editMessageUseCase.execute({
        messageId,
        newContent,
        session
      });

      if (result.success && result.message) {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId ? result.message! : msg
          ),
          pendingByMessageId: { ...prev.pendingByMessageId, [messageId]: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to edit message',
          pendingByMessageId: { ...prev.pendingByMessageId, [messageId]: false }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to edit message',
        pendingByMessageId: { ...prev.pendingByMessageId, [messageId]: false }
      }));
    }
  }, [session, editMessageUseCase]);

  const resendMessage = useCallback(async (userMessageId: string, model?: string) => {
    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      pendingByMessageId: { ...prev.pendingByMessageId, [userMessageId]: true },
      error: null 
    }));

    try {
      const accessToken = await dependencies.getAccessToken();
      if (!accessToken) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to get access token',
          pendingByMessageId: { ...prev.pendingByMessageId, [userMessageId]: false }
        }));
        return;
      }

      const result = await resendMessageUseCase.execute({
        userMessageId,
        session,
        model,
        accessToken
      });

      if (result.success && result.assistantMessage) {
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, result.assistantMessage!],
          pendingByMessageId: { ...prev.pendingByMessageId, [userMessageId]: false }
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to resend message',
          pendingByMessageId: { ...prev.pendingByMessageId, [userMessageId]: false }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to resend message',
        pendingByMessageId: { ...prev.pendingByMessageId, [userMessageId]: false }
      }));
    }
  }, [session, dependencies, resendMessageUseCase]);

  const regenerateAssistant = useCallback(async (targetId: string, model?: string) => {
    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      pendingByMessageId: { ...prev.pendingByMessageId, [targetId]: true },
      error: null 
    }));

    try {
      const accessToken = await dependencies.getAccessToken();
      if (!accessToken) {
        setState(prev => ({ 
          ...prev, 
          error: 'Failed to get access token',
          pendingByMessageId: { ...prev.pendingByMessageId, [targetId]: false }
        }));
        return;
      }

      const result = await regenerateAssistantUseCase.execute({
        targetId,
        session,
        model,
        accessToken
      });

      if (result.success && result.newAssistantMessage) {
        setState(prev => {
          let updatedMessages = prev.messages;

          // Update superseded message if it exists
          if (result.supersededMessage) {
            updatedMessages = updatedMessages.map(msg =>
              msg.id === result.supersededMessage!.id ? result.supersededMessage! : msg
            );
          }

          // Add or replace the assistant message
          const existingIndex = updatedMessages.findIndex(msg => msg.id === result.newAssistantMessage!.id);
          if (existingIndex >= 0) {
            updatedMessages[existingIndex] = result.newAssistantMessage!;
          } else {
            updatedMessages = [...updatedMessages, result.newAssistantMessage!];
          }

          return {
            ...prev,
            messages: updatedMessages,
            pendingByMessageId: { ...prev.pendingByMessageId, [targetId]: false }
          };
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || 'Failed to regenerate response',
          pendingByMessageId: { ...prev.pendingByMessageId, [targetId]: false }
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Failed to regenerate response',
        pendingByMessageId: { ...prev.pendingByMessageId, [targetId]: false }
      }));
    }
  }, [session, dependencies, regenerateAssistantUseCase]);

  return {
    ...state,
    sendMessage,
    receiveMessage,
    deleteMessage,
    copyMessage,
    editMessage,
    resendMessage,
    regenerateAssistant,
    setInputValue,
    clearError,
    loadMessages
  };
}
