// Presentation layer hook - Connects UI to business layer
import { useCallback, useEffect, useState } from 'react';
import { 
  CreateChatRoomUseCase, 
  LoadMessagesUseCase, 
  SendMessageUseCase 
} from '../../business/usecases';
import { 
  SupabaseChatRoomRepository, 
  SupabaseMessageRepository 
} from '../../persistence/repositories';
import { OpenAIProvider } from '../../persistence/adapters';
import { MessageData } from '../components/chat/MessageItem';

interface UseChatPresentationProps {
  roomId: number | null;
  userId: string;
  selectedModel: string;
  isSearchMode?: boolean;
}

export interface ChatPresentationState {
  // Data
  messages: MessageData[];
  input: string;
  loading: boolean;
  sending: boolean;
  isTyping: boolean;
  
  // Actions
  onInputChange: (text: string) => void;
  onSendMessage: () => void;
  onRegenerateMessage: (index: number) => void;
  onEditUserMessage: (index: number, newText: string) => void;
  onLikeMessage: (messageId: string) => void;
  onDislikeMessage: (messageId: string) => void;
  
  // Status
  error?: string;
}

/**
 * Presentation hook that orchestrates business use cases
 * This is the bridge between clean UI and business logic
 */
export const useChatPresentation = ({
  roomId,
  userId,
  selectedModel,
  isSearchMode = false
}: UseChatPresentationProps): ChatPresentationState => {
  // State
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string>();

  // Use cases (in a real app, these would be injected via DI)
  const messageRepository = new SupabaseMessageRepository();
  const chatRoomRepository = new SupabaseChatRoomRepository();
  const aiProvider = new OpenAIProvider();
  
  const sendMessageUseCase = new SendMessageUseCase(messageRepository, aiProvider);
  const loadMessagesUseCase = new LoadMessagesUseCase(messageRepository);
  const createChatRoomUseCase = new CreateChatRoomUseCase(chatRoomRepository);

  // Load messages when room changes
  useEffect(() => {
    if (roomId && userId) {
      loadMessages();
    }
  }, [roomId, userId]);

  const loadMessages = useCallback(async () => {
    if (!roomId) return;
    
    setLoading(true);
    setError(undefined);
    
    try {
      const result = await loadMessagesUseCase.execute({
        roomId,
        userId
      });
      
      if (result.success) {
        setMessages(result.messages);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [roomId, userId]);

  const onInputChange = useCallback((text: string) => {
    setInput(text);
  }, []);

  const onSendMessage = useCallback(async () => {
    if (!input.trim() || !roomId || sending) return;
    
    setSending(true);
    setError(undefined);
    
    // Optimistic update - add user message immediately
    const userMessage: MessageData = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    const messageContent = input.trim();
    setInput(''); // Clear input immediately
    
    try {
      const result = await sendMessageUseCase.execute({
        content: messageContent,
        roomId,
        userId,
        model: selectedModel,
        isSearchMode
      });
      
      if (result.success) {
        // Replace optimistic user message and add assistant message
        setMessages(prev => {
          const withoutTemp = prev.filter(m => m.id !== userMessage.id);
          return [
            ...withoutTemp,
            {
              id: result.userMessage.id,
              role: 'user' as const,
              content: result.userMessage.content,
              timestamp: result.userMessage.timestamp
            },
            {
              id: result.assistantMessage.id,
              role: 'assistant' as const,
              content: result.assistantMessage.content,
              timestamp: result.assistantMessage.timestamp
            }
          ];
        });
      } else {
        // Remove optimistic message and show error
        setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        setError(result.error);
        setInput(messageContent); // Restore input
      }
    } catch (err) {
      // Remove optimistic message and show error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
      setError(err instanceof Error ? err.message : 'Failed to send message');
      setInput(messageContent); // Restore input
    } finally {
      setSending(false);
    }
  }, [input, roomId, userId, selectedModel, isSearchMode, sending]);

  const onRegenerateMessage = useCallback(async (index: number) => {
    // Implementation would regenerate the assistant message at the given index
    console.log('Regenerate message at index:', index);
    // This would call a regenerate use case
  }, []);

  const onEditUserMessage = useCallback(async (index: number, newText: string) => {
    // Implementation would edit the user message and regenerate following assistant message
    console.log('Edit user message at index:', index, 'with text:', newText);
    // This would call an edit + regenerate use case
  }, []);

  const onLikeMessage = useCallback((messageId: string) => {
    console.log('Like message:', messageId);
    // This would call a rating use case
  }, []);

  const onDislikeMessage = useCallback((messageId: string) => {
    console.log('Dislike message:', messageId);
    // This would call a rating use case
  }, []);

  return {
    // Data
    messages,
    input,
    loading,
    sending,
    isTyping,
    
    // Actions
    onInputChange,
    onSendMessage,
    onRegenerateMessage,
    onEditUserMessage,
    onLikeMessage,
    onDislikeMessage,
    
    // Status
    error
  };
};
