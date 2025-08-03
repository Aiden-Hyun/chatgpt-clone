// Moved Picker inside ChatHeader component
import { useLocalSearchParams, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLogout } from '../../src/features/auth';
import { ChatHeader, ChatInput, ChatMessageList } from '../../src/features/chat/components';
import { useChat } from '../../src/features/chat/hooks';
import { LoadingWrapper } from '../../src/shared/components';
import { useBackButtonHandler, useInputFocus } from '../../src/shared/hooks';
import { createChatStyles } from './chat.styles';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const numericRoomId = roomId ? parseInt(roomId, 10) : null;
  const { inputRef, maintainFocus } = useInputFocus();
  const { disableBackButton } = useBackButtonHandler({ enabled: true });
  const styles = createChatStyles();

  const {
    messages,
    input,
    loading,
    sending,
    isTyping,
    sendMessage: originalSendMessage,
    handleInputChange,
    regenerateMessage,
  } = useChat(numericRoomId);
  const { logout } = useLogout();
  
  // Wrap sendMessage to maintain focus after sending
  const sendMessage = async () => {
    await originalSendMessage();
    maintainFocus();
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
        />

        {/* Messages */}
        <ChatMessageList
          messages={messages}
          isTyping={isTyping}
          regenerateMessage={regenerateMessage}
        />

        {/* Input */}
        <ChatInput
          input={input}
          onChangeText={handleInputChange}
          onSend={sendMessage}
          sending={sending}
          isTyping={isTyping}
          inputRef={inputRef}
        />
      </KeyboardAvoidingView>
    </LoadingWrapper>
  );
} 