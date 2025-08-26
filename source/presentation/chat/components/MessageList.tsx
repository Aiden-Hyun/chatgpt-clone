import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { MessageEntity } from '../../../business/chat/entities/Message';
import { MessageItem } from './MessageItem';

interface MessageListProps {
  messages: MessageEntity[];
  onDeleteMessage: (messageId: string) => void;
  onCopyMessage: (messageId: string) => void;
  isLoading: boolean;
}

export function MessageList({ 
  messages, 
  onDeleteMessage, 
  onCopyMessage, 
  isLoading 
}: MessageListProps) {
  const renderMessage = ({ item }: { item: MessageEntity }) => (
    <MessageItem
      message={item}
      onDelete={() => onDeleteMessage(item.id)}
      onCopy={() => onCopyMessage(item.id)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        {isLoading ? 'Loading messages...' : 'No messages yet. Start a conversation!'}
      </Text>
    </View>
  );

  return (
    <FlatList
      data={messages}
      renderItem={renderMessage}
      keyExtractor={(item) => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListEmptyComponent={renderEmptyState}
      showsVerticalScrollIndicator={false}
      inverted={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100, // Space for input
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
