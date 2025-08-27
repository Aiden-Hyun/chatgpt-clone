import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MessageEntity } from '../../../business/chat/entities/Message';
import { MessageFormatter } from '../../../service/chat/utils/MessageFormatter';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';

interface MessageItemProps {
  message: MessageEntity;
  onDelete: () => void;
  onCopy: () => void;
  onEdit: (newContent: string) => void;
  onResend: () => void;
  onRegenerate: () => void;
  isPending: boolean;
  currentUserId: string;
}

export function MessageItem({ 
  message, 
  onDelete, 
  onCopy, 
  onEdit, 
  onResend, 
  onRegenerate, 
  isPending, 
  currentUserId 
}: MessageItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  
  const isUserMessage = message.isUserMessage();
  const isAssistantMessage = message.isAssistantMessage();
  const isDeleted = message.isDeleted;
  const canEdit = message.canBeEdited(currentUserId);
  const isEdited = message.isEdited();
  const isSuperseded = message.isSuperseded();

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit(editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleLongPress = () => {
    if (isDeleted || isPending) return;

    const options = [
      { text: 'Cancel', style: 'cancel' as const },
      { 
        text: 'Copy', 
        onPress: onCopy,
        style: 'default' as const
      }
    ];

    // Add edit option for user messages
    if (canEdit) {
      options.push({
        text: 'Edit',
        onPress: () => setIsEditing(true),
        style: 'default' as const
      });
    }

    // Add resend option for user messages
    if (isUserMessage && message.userId === currentUserId) {
      options.push({
        text: 'Resend',
        onPress: onResend,
        style: 'default' as const
      });
    }

    // Add regenerate option for assistant messages
    if (isAssistantMessage) {
      options.push({
        text: 'Regenerate',
        onPress: onRegenerate,
        style: 'default' as const
      });
    }

    // Add delete option
    if (message.canBeDeleted()) {
      options.push({
        text: 'Delete',
        onPress: onDelete,
        style: 'destructive' as const
      });
    }

    Alert.alert(
      'Message Options',
      'What would you like to do with this message?',
      options
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isUserMessage ? styles.userMessage : styles.assistantMessage,
        isDeleted && styles.deletedMessage,
        isSuperseded && styles.supersededMessage
      ]}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      disabled={isPending}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[
            styles.role,
            isUserMessage ? styles.userRole : styles.assistantRole
          ]}>
            {isUserMessage ? 'You' : 'AI Assistant'}
          </Text>
          {isEdited && (
            <Text style={styles.editedBadge}>Edited</Text>
          )}
          {isSuperseded && (
            <Text style={styles.supersededBadge}>Superseded</Text>
          )}
        </View>
        <View style={styles.headerRight}>
          {isPending && (
            <ActivityIndicator 
              size="small" 
              color={isUserMessage ? '#FFFFFF' : '#000000'} 
              style={styles.spinner}
            />
          )}
          <Text style={styles.timestamp}>
            {MessageFormatter.formatTimestamp(message.timestamp)}
          </Text>
        </View>
      </View>
      
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={[
              styles.editInput,
              isUserMessage ? styles.editInputUser : styles.editInputAssistant
            ]}
            value={editContent}
            onChangeText={setEditContent}
            multiline
            autoFocus
            placeholder="Edit your message..."
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.editButton} onPress={handleCancelEdit}>
              <Text style={styles.editButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.editButton} onPress={handleSaveEdit}>
              <Text style={styles.editButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[
          styles.contentContainer,
          isDeleted && styles.deletedContent,
          isUserMessage ? styles.userContent : styles.assistantContent
        ]}>
          <MarkdownRenderer>
            {MessageFormatter.formatForDisplay(message.getDisplayContent())}
          </MarkdownRenderer>
        </View>
      )}
      
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
          {message.metadata.editedAt && (
            <Text style={styles.metadataText}>
              Edited: {MessageFormatter.formatTimestamp(message.metadata.editedAt)}
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
  supersededMessage: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  editedBadge: {
    fontSize: 10,
    color: '#8E8E93',
    backgroundColor: 'rgba(142, 142, 147, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  supersededBadge: {
    fontSize: 10,
    color: '#FF3B30',
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    marginLeft: 6,
  },
  spinner: {
    marginRight: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  contentContainer: {
    flex: 1,
  },
  userContent: {
    color: '#FFFFFF',
  },
  assistantContent: {
    color: '#000000',
  },
  deletedContent: {
    fontStyle: 'italic',
    color: '#8E8E93',
  },
  editContainer: {
    marginTop: 8,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editInputUser: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#000000',
  },
  editInputAssistant: {
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
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
