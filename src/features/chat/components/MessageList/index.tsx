import React, { useRef } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';
import { ChatMessage } from '../../types';
import { MessageItem } from '../MessageItem';

interface MessageListProps {
  messages: ChatMessage[];
  isNewMessageLoading: boolean;
  regeneratingIndices: Set<number>;
  onRegenerate: (index: number) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isNewMessageLoading,
  regeneratingIndices,
  onRegenerate,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.xs,
      flexGrow: 1,
    },
  });

  // Add empty assistant message for new message loading
  const messagesWithLoading = isNewMessageLoading
    ? [...messages, { role: 'assistant', content: '' }]
    : messages;

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isRegenerating = regeneratingIndices.has(index);
    
    // Group consecutive messages from the same sender
    const showAvatar =
      index === 0 || (index > 0 && messagesWithLoading[index - 1].role !== item.role);
    const isLastInGroup =
      index === messagesWithLoading.length - 1 ||
      (index < messagesWithLoading.length - 1 && messagesWithLoading[index + 1].role !== item.role);

    return (
      <MessageItem
        message={item}
        index={index}
        isNewMessageLoading={isNewMessageLoading && index === messages.length}
        isRegenerating={isRegenerating}
        onRegenerate={
          item.role === 'assistant' && !isRegenerating && !isNewMessageLoading
            ? () => onRegenerate(index)
            : undefined
        }
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
      />
    );
  };

  return (
    <FlatList
      data={messagesWithLoading}
      keyExtractor={(_, index) => index.toString()}
      renderItem={renderMessage}
      contentContainerStyle={styles.container}
      ref={flatListRef}
      extraData={[messages, isNewMessageLoading, regeneratingIndices]}
      onContentSizeChange={() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }}
      onLayout={() => {
        flatListRef.current?.scrollToEnd({ animated: false });
      }}
    />
  );
}; 