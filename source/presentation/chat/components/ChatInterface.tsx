import React, { useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useChatViewModel } from '../../../business/chat/view-models/useChatViewModel';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';

interface ChatInterfaceProps {
  roomId: string;
  userId: string;
}

export function ChatInterface({ roomId, userId }: ChatInterfaceProps) {
  const {
    messages,
    currentRoom,
    isLoading,
    error,
    inputValue,
    sendMessage,
    deleteMessage,
    copyMessage,
    setInputValue,
    clearError,
    loadMessages
  } = useChatViewModel(userId);

  useEffect(() => {
    loadMessages(roomId);
  }, [roomId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [
        { text: 'OK', onPress: clearError }
      ]);
    }
  }, [error]);

  const handleSendMessage = async (content: string) => {
    if (content.trim()) {
      await sendMessage(content.trim());
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMessage(messageId)
        }
      ]
    );
  };

  const handleCopyMessage = async (messageId: string) => {
    await copyMessage(messageId);
    Alert.alert('Success', 'Message copied to clipboard');
  };

  return (
    <View style={styles.container}>
      <ChatHeader 
        roomName={currentRoom?.getDisplayName() || 'Chat'}
        messageCount={messages.length}
        isLoading={isLoading}
      />
      
      <MessageList
        messages={messages}
        onDeleteMessage={handleDeleteMessage}
        onCopyMessage={handleCopyMessage}
        isLoading={isLoading}
      />
      
      <ChatInput
        value={inputValue}
        onChangeText={setInputValue}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        disabled={!currentRoom}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});
