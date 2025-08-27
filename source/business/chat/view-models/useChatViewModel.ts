import { useCallback, useState } from 'react';
import { useAuth } from '../../../../src/features/auth/context/AuthContext';
import { supabase } from '../../../../src/shared/lib/supabase';
import { ChatRoomEntity } from '../entities/ChatRoom';
import { MessageEntity } from '../entities/Message';
import { CopyMessageUseCase } from '../use-cases/CopyMessageUseCase';
import { DeleteMessageUseCase } from '../use-cases/DeleteMessageUseCase';
import { ReceiveMessageUseCase } from '../use-cases/ReceiveMessageUseCase';
import { SendMessageUseCase } from '../use-cases/SendMessageUseCase';
import { IMessageRepository } from '../interfaces/IMessageRepository';
import { IChatRoomRepository } from '../interfaces/IChatRoomRepository';

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

interface ChatViewModelDependencies {
  sendMessageUseCase: SendMessageUseCase;
  receiveMessageUseCase: ReceiveMessageUseCase;
  deleteMessageUseCase: DeleteMessageUseCase;
  copyMessageUseCase: CopyMessageUseCase;
  messageRepository: IMessageRepository;
  chatRoomRepository: IChatRoomRepository;
}

export function useChatViewModel(
  userId: string,
  dependencies: ChatViewModelDependencies
): ChatState & ChatActions {
  const { session } = useAuth();
  
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentRoom: null,
    isLoading: false,
    error: null,
    inputValue: ''
  });

  // Helper function to get fresh access token
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!session) return null;
    
    let accessToken = session.access_token;

    // Check if token is expired and refresh if needed
    if (session.expires_at && Math.floor(Date.now() / 1000) > session.expires_at) {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (!error && data.session) {
          accessToken = data.session.access_token;
        }
      } catch {
        // Continue with existing token
      }
    }

    return accessToken;
  }, [session]);

  // Destructure injected dependencies
  const {
    sendMessageUseCase,
    receiveMessageUseCase,
    deleteMessageUseCase,
    copyMessageUseCase,
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
      const accessToken = await getAccessToken();
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
  }, [state.currentRoom, userId, session, getAccessToken]);

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
    if (!session) {
      setState(prev => ({ ...prev, error: 'Authentication required' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const room = await chatRoomRepository.getById(roomId, session);
      const messages = await messageRepository.getByRoomId(roomId, session);

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
  }, [userId, session]);

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
