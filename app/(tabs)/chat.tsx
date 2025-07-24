// Moved Picker inside ChatHeader component
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  BackHandler,


  KeyboardAvoidingView,
  Platform,

  TextInput,
  View,
} from 'react-native';
import { ChatHeader, ChatInput, ChatMessageList } from '../../src/features/chat/components';
import { useChat } from '../../src/features/chat/hooks';
import { supabase } from '../../src/shared/lib/supabase';
import { styles } from './chat.styles';


export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const numericRoomId = roomId ? parseInt(roomId, 10) : null;
  const inputRef = useRef<TextInput | null>(null);

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
  
  // Wrap sendMessage to maintain focus after sending
  const sendMessage = async () => {
    await originalSendMessage();
    // Focus the input field after sending
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Disable Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
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
        onLogout={async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        }}
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
