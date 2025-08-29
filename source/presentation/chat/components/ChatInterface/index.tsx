import React from 'react';
import { View } from 'react-native';
import { useChatViewModel } from '../../../../business/chat/view-models/useChatViewModel';
import { createChatStyles } from '../../../app/chat/chat.styles';
import { useBusinessContext } from '../../../shared/BusinessContextProvider';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { MessageList } from '../MessageList';

interface ChatInterfaceProps {
  roomId?: number;
  initialModel?: string;
  className?: string;
  showHeader?: boolean;
  selectedModel?: string;
  onChangeModel?: (model: string) => void | Promise<void>;
  // New props to expose chat state to parent
  onChatStateChange?: (state: {
    input: string;
    handleInputChange: (text: string) => void;
    sendMessage: () => void;
    sending: boolean;
    isTyping: boolean;
    isSearchMode: boolean;
    onSearchToggle: () => void;
  }) => void;
}

/**
 * ChatInterface - Messages Only Component
 * 
 * This component now only handles messages, with chat input moved to parent.
 * This provides better layout control and responsive behavior.
 */
export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  roomId,
  initialModel = 'gpt-3.5-turbo',
  className,
  showHeader = true,
  selectedModel,
  onChangeModel,
  onChatStateChange,
}) => {
  console.log('🔍 ChatInterface: Starting render with roomId:', roomId);
  
  // Get proven styles - memoized to prevent excessive re-renders
  const theme = useAppTheme();
  const { businessProvider } = useBusinessContext();
  const styles = React.useMemo(() => createChatStyles(theme), [theme]);
  
  console.log('🔍 ChatInterface: Hooks result:', { theme: !!theme, businessProvider: !!businessProvider });
  
  // Use the business layer view model with proper dependencies
  const {
    messages,
    isLoading: loading,
    inputValue: input,
    setInputValue: handleInputChange,
    sendMessage,
    error,
  } = useChatViewModel(roomId?.toString() || '', {
    sendMessageUseCase: businessProvider.getUseCaseFactory().createSendMessageUseCase(),
    receiveMessageUseCase: businessProvider.getUseCaseFactory().createReceiveMessageUseCase(),
    deleteMessageUseCase: businessProvider.getUseCaseFactory().createDeleteMessageUseCase(),
    copyMessageUseCase: businessProvider.getUseCaseFactory().createCopyMessageUseCase(),
    editMessageUseCase: businessProvider.getUseCaseFactory().createEditMessageUseCase(),
    resendMessageUseCase: businessProvider.getUseCaseFactory().createResendMessageUseCase(),
    regenerateAssistantUseCase: businessProvider.getUseCaseFactory().createRegenerateAssistantUseCase(),
    messageRepository: businessProvider.getMessageRepository(),
    chatRoomRepository: businessProvider.getChatRoomRepository(),
    getAccessToken: async () => businessProvider.getSessionRepository().get()?.then(session => session?.accessToken || null),
  }, null);

  // Memoize the chat state object to prevent unnecessary parent re-renders
  const chatState = React.useMemo(() => ({
    input,
    handleInputChange,
    sendMessage: () => sendMessage(input),
    sending: loading,
    isTyping: false,
    isSearchMode: false,
    onSearchToggle: () => {},
  }), [input, handleInputChange, sendMessage, loading]);

  // Expose chat state to parent component
  React.useEffect(() => {
    if (onChatStateChange) {
      onChatStateChange(chatState);
    }
  }, [chatState, onChatStateChange]);

  // Like/dislike handlers - simplified for now
  const handleLike = React.useCallback((messageId: string) => {
    console.log('Like message:', messageId);
  }, []);

  const handleDislike = React.useCallback((messageId: string) => {
    console.log('Dislike message:', messageId);
  }, []);

  console.log('🔍 ChatInterface: About to render MessageList with', { 
    messagesCount: messages?.length, 
    loading,
    MessageList: !!MessageList 
  });

  return (
    <View style={styles.container}>
      {/* Messages using proven MessageList component - memoized to prevent input-related re-renders */}
      {React.useMemo(() => {
        console.log('🔍 ChatInterface: Rendering MessageList');
        return (
          <MessageList
            messages={messages}
            regeneratingIndex={null}
            onRegenerate={() => {}}
            onUserEditRegenerate={() => {}}
            showWelcomeText={messages.length === 0}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        );
      }, [messages, loading, handleLike, handleDislike])}
    </View>
  );
};

export default ChatInterface;