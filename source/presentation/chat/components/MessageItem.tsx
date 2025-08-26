import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MessageEntity, MessageRole } from '../../../business/chat/entities/Message';
import { MessageFormatter } from '../../../service/chat/utils/MessageFormatter';

interface MessageItemProps {
  message: MessageEntity;
  onDelete: () => void;
  onCopy: () => void;
}

export function MessageItem({ message, onDelete, onCopy }: MessageItemProps) {
  const isUserMessage = message.isUserMessage();
  const isAssistantMessage = message.isAssistantMessage();
  const isDeleted = message.isDeleted;

  const handleLongPress = () => {
    if (isDeleted) return;

    Alert.alert(
      'Message Options',
      'What would you like to do with this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Copy', 
          onPress: onCopy,
          style: 'default'
        },
        ...(message.canBeDeleted() ? [{
          text: 'Delete',
          onPress: onDelete,
          style: 'destructive'
        }] : [])
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUserMessage ? styles.userMessage : styles.assistantMessage,
        isDeleted && styles.deletedMessage
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <Text style={[
          styles.role,
          isUserMessage ? styles.userRole : styles.assistantRole
        ]}>
          {isUserMessage ? 'You' : 'AI Assistant'}
        </Text>
        <Text style={styles.timestamp}>
          {MessageFormatter.formatTimestamp(message.timestamp)}
        </Text>
      </View>
      
      <Text style={[
        styles.content,
        isDeleted && styles.deletedContent
      ]}>
        {message.getDisplayContent()}
      </Text>
      
      {message.metadata && (
        <View style={styles.metadata}>
          {message.metadata.model && (
            <Text style={styles.metadataText}>
              Model: {message.metadata.model}
            </Text>
          )}
          {message.metadata.tokens && (
            <Text style={styles.metadataText}>
              Tokens: {message.metadata.tokens}
            </Text>
          )}
          {message.metadata.processingTime && (
            <Text style={styles.metadataText}>
              Time: {message.metadata.processingTime}ms
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
  },
  deletedMessage: {
    opacity: 0.6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    color: '#FFFFFF',
  },
  assistantRole: {
    color: '#000000',
  },
  timestamp: {
    fontSize: 12,
    color: '#8E8E93',
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  deletedContent: {
    fontStyle: 'italic',
    color: '#8E8E93',
  },
  metadata: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  metadataText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
});
