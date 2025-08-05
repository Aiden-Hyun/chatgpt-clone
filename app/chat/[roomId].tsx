// Moved Picker inside ChatHeader component
import { router, useLocalSearchParams } from 'expo-router';
import {
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useLogout } from '../../src/features/auth';
import { ChatHeader, ChatInput, MessageList } from '../../src/features/chat/components';
import { useChatRooms } from '../../src/features/chat/hooks';
import { useChatSimplified } from '../../src/features/chat/hooks/useChatSimplified';
import { LoadingWrapper } from '../../src/features/ui';
import { useBackButtonHandler, useInputFocus } from '../../src/shared/hooks';
import { createChatStyles } from './chat.styles';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  
  // Handle temporary room IDs - if roomId starts with 'temp_', treat it as a new room
  const isTemporaryRoom = roomId?.startsWith('temp_');
  const numericRoomId = isTemporaryRoom ? null : (roomId ? parseInt(roomId, 10) : null);
  
  const { inputRef, maintainFocus } = useInputFocus();
  const { disableBackButton } = useBackButtonHandler({ enabled: true });
  const { startNewChat } = useChatRooms();
  const styles = createChatStyles();

  const {
    messages,
    loading,
    input,
    isNewMessageLoading,
    regeneratingIndices,
    sendMessage: originalSendMessage,
    handleInputChange,
    regenerateMessage,
  } = useChatSimplified(numericRoomId);
  const { logout } = useLogout();
  
  // Wrap sendMessage to maintain focus after sending
  const sendMessage = async () => {
    await originalSendMessage();
    maintainFocus();
  };

  const handleNewChat = () => {
    startNewChat();
  };

  const handleChatSelect = (selectedRoomId: string) => {
    router.push({ pathname: '/chat/[roomId]', params: { roomId: selectedRoomId } });
  };

  const handleBack = () => {
    router.push('/');
  };

  // Back button is automatically disabled by useBackButtonHandler hook

  return (
    <LoadingWrapper loading={loading}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ChatHeader
          onLogout={logout}
          onSettings={() => router.push('/settings')}
          onBack={handleBack}
          onNewChat={handleNewChat}
          onChatSelect={handleChatSelect}
          selectedChatId={roomId}
        />

        {/* Messages */}
        <MessageList
          messages={messages}
          isNewMessageLoading={isNewMessageLoading}
          regeneratingIndices={regeneratingIndices}
          onRegenerate={regenerateMessage}
        />

        {/* Input */}
        <ChatInput
          input={input}
          onChangeText={handleInputChange}
          onSend={sendMessage}
          sending={isNewMessageLoading}
          isTyping={isNewMessageLoading}
          inputRef={inputRef}
        />
      </KeyboardAvoidingView>
    </LoadingWrapper>
  );
} 