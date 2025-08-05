import React, { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useAppTheme } from '../../../shared/hooks';
import { ChatMessage } from '../types';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
  regeneratingIndex: number | null;
  regenerateMessage: (index: number) => void;
}

/**
 * ChatMessageList
 * Renders a scrollable list of chat messages, including typing animations
 * and grouping logic.
 */
const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping,
  regeneratingIndex,
  regenerateMessage,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    messagesList: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      flexGrow: 1,
    },
  });

  // Create a temporary assistant message for loading state (only for new messages, not regeneration)
  const messagesWithLoading = isTyping && regeneratingIndex === null
    ? [...messages, { role: 'assistant', content: '' }]
    : messages;

  return (
    <FlatList
      data={messagesWithLoading}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => {
        // Only show typing for new messages at the bottom
        const isCurrentlyTyping =
          isTyping && regeneratingIndex === null && index === messages.length && item.role === 'assistant';
        // Show regenerating for specific message index
        const isRegenerating = regeneratingIndex === index && item.role === 'assistant';
        
        // Group consecutive messages from the same sender
        const showAvatar =
          index === 0 || (index > 0 && messagesWithLoading[index - 1].role !== item.role);
        const isLastInGroup =
          index === messagesWithLoading.length - 1 ||
          (index < messagesWithLoading.length - 1 && messagesWithLoading[index + 1].role !== item.role);

        return (
          <ChatMessageBubble
            item={item}
            isTyping={isCurrentlyTyping || isRegenerating}
            onRegenerate={
              item.role === 'assistant' && !isCurrentlyTyping && !isRegenerating ? () => regenerateMessage(index) : undefined
            }
            showAvatar={showAvatar}
            isLastInGroup={isLastInGroup}
          />
        );
      }}
      contentContainerStyle={styles.messagesList}
      ref={flatListRef}
      extraData={[messages, isTyping]}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
      onLayout={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
};

export default ChatMessageList;
