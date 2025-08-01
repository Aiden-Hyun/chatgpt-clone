import React, { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';

import { useAppTheme } from '../../../shared/hooks';
import { ChatMessage } from '../types';
import ChatMessageBubble from './ChatMessageBubble';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping: boolean;
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

  return (
    <FlatList
      data={messages}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item, index }) => {
        const isCurrentlyTyping =
          isTyping && index === messages.length - 1 && item.role === 'assistant';
        // Group consecutive messages from the same sender
        const showAvatar =
          index === 0 || (index > 0 && messages[index - 1].role !== item.role);
        const isLastInGroup =
          index === messages.length - 1 ||
          (index < messages.length - 1 && messages[index + 1].role !== item.role);

        return (
          <ChatMessageBubble
            item={item}
            isTyping={isCurrentlyTyping}
            onRegenerate={
              item.role === 'assistant' ? () => regenerateMessage(index) : undefined
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
