// Moved Picker inside ChatHeader component
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from 'react-native';
import { useLogout } from '../../../src/features/auth';
import { ChatHeader, ChatInput, ChatMessageList } from '../../../src/features/chat/components';
import { useChat } from '../../../src/features/chat/hooks';
import { useBackButtonHandler, useInputFocus } from '../../../src/shared/hooks';
import { createChatStyles } from './chat.styles';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const numericRoomId = roomId ? parseInt(roomId, 10) : null;
  const { inputRef, maintainFocus } = useInputFocus();
  const { disableBackButton } = useBackButtonHandler();
  const styles = createChatStyles();

  const {
    messages,
    input,
    loading,
    sending,
    isTyping,
    sendMessage: originalSendMessage,
    handleInputChange,
    selectedModel,
    updateModel,
    regenerateMessage,
  } = useChat(numericRoomId);
  const { logout } = useLogout();
  
  // Wrap sendMessage to maintain focus after sending
  const sendMessage = async () => {
    await originalSendMessage();
    maintainFocus();
  };

  // Disable Android back button using hook
  useFocusEffect(
    useCallback(() => {
      return disableBackButton();
    }, [disableBackButton])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ChatHeader
        selectedModel={selectedModel}
        updateModel={updateModel}
        onLogout={logout}
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
  );
}
