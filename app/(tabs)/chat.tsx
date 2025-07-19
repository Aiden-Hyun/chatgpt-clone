import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChatMessageBubble from '../../src/components/ChatMessageBubble';
import { useChat } from '../../src/hooks/useChat';
import { supabase } from '../../src/supabase';
import { styles } from './chat.styles';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const numericRoomId = roomId ? parseInt(roomId, 10) : null;
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

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
      {/* Header with Model Selection and Logout */}
      <View style={styles.header}>
        <View style={styles.modelSelector}>
          <Text style={styles.modelLabel}>Model:</Text>
          <Picker
            selectedValue={selectedModel}
            onValueChange={(value) => updateModel(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="GPT-3.5 Turbo" value="gpt-3.5-turbo" />
            <Picker.Item label="GPT-3.5 Turbo-16k" value="gpt-3.5-turbo-16k" />
            <Picker.Item label="GPT-4" value="gpt-4" />
            <Picker.Item label="GPT-4 Turbo" value="gpt-4-turbo" />
            <Picker.Item label="GPT-4o" value="gpt-4o" />
          </Picker>
        </View>
        <Button
          title="Logout"
          onPress={async () => {
            await supabase.auth.signOut();
            router.replace('/login');
          }}
        />
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isCurrentlyTyping = isTyping && index === messages.length - 1 && item.role === 'assistant';
          // Group consecutive messages from the same sender
          const showAvatar = index === 0 || 
            (index > 0 && messages[index - 1].role !== item.role);
          const isLastInGroup = index === messages.length - 1 || 
            (index < messages.length - 1 && messages[index + 1].role !== item.role);
          
          return (
            <ChatMessageBubble 
              item={item} 
              isTyping={isCurrentlyTyping}
              onRegenerate={item.role === 'assistant' ? () => regenerateMessage(index) : undefined}
              showAvatar={showAvatar}
              isLastInGroup={isLastInGroup}
            />
          );
        }}
        contentContainerStyle={styles.messagesList}
        ref={flatListRef}
        extraData={[messages, isTyping]} // Force re-render when these change
        onContentSizeChange={() => {
          // Scroll to bottom when content size changes (new messages or typing)
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          // Scroll to bottom on initial layout
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
      />

      {/* Input */}
      <View style={styles.inputRow}>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={handleInputChange}
          placeholder="Type a message..."
          onKeyPress={({ nativeEvent }) => {
            if (nativeEvent.key === 'Enter' && !sending && input.trim()) {
              sendMessage();
            }
          }}
          autoFocus
        />
        <TouchableOpacity 
          style={[styles.sendButton, sending && styles.disabledButton]} 
          onPress={sendMessage} 
          disabled={sending}
        >
          <Text style={styles.sendButtonText}>{sending ? '...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
