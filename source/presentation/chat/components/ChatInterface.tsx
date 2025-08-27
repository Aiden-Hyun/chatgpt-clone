import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useAuth } from '../../../../src/features/auth/context/AuthContext';
import { useChatViewModel } from '../../../business/chat/view-models/useChatViewModel';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';

interface ChatInterfaceProps {
  roomId: string;
  userId: string;
}

export function ChatInterface({ roomId, userId }: ChatInterfaceProps) {
  const { session } = useAuth();
  const { useCaseFactory, getAccessToken } = useBusinessContext();
  const {
    messages,
    currentRoom,
    isLoading,
    error,
    inputValue,
    pendingByMessageId,
    sendMessage,
    deleteMessage,
    copyMessage,
    editMessage,
    resendMessage,
    regenerateAssistant,
    setInputValue,
    clearError,
    loadMessages
  } = useChatViewModel(userId, {
    sendMessageUseCase: useCaseFactory.createSendMessageUseCase(),
    receiveMessageUseCase: useCaseFactory.createReceiveMessageUseCase(),
    deleteMessageUseCase: useCaseFactory.createDeleteMessageUseCase(),
    copyMessageUseCase: useCaseFactory.createCopyMessageUseCase(),
    editMessageUseCase: useCaseFactory.createEditMessageUseCase(),
    resendMessageUseCase: useCaseFactory.createResendMessageUseCase(),
    regenerateAssistantUseCase: useCaseFactory.createRegenerateAssistantUseCase(),
    messageRepository: useCaseFactory['messageRepository'] ?? (useCaseFactory as any),
    chatRoomRepository: useCaseFactory['chatRoomRepository'] ?? (useCaseFactory as any),
    getAccessToken
  }, session);

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

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessage(messageId, newContent);
  };

  const handleResendMessage = async (userMessageId: string) => {
    await resendMessage(userMessageId);
  };

  const handleRegenerateAssistant = async (targetId: string) => {
    await regenerateAssistant(targetId);
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
        onEditMessage={handleEditMessage}
        onResendMessage={handleResendMessage}
        onRegenerateAssistant={handleRegenerateAssistant}
        pendingByMessageId={pendingByMessageId}
        currentUserId={userId}
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
