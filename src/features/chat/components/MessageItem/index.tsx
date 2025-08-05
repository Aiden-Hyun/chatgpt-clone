import React from 'react';
import { View } from 'react-native';
import { ChatMessage } from '../../types';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { LoadingMessage } from '../LoadingMessage';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  isNewMessageLoading: boolean;
  isRegenerating: boolean;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isNewMessageLoading,
  isRegenerating,
  onRegenerate,
  showAvatar = true,
  isLastInGroup = true,
}) => {
  // Show loading message for new messages at the bottom
  if (isNewMessageLoading && index === 0 && message.role === 'assistant' && !message.content) {
    return <LoadingMessage />;
  }

  // Show loading message for regenerating messages
  if (isRegenerating && message.role === 'assistant') {
    return <LoadingMessage />;
  }

  // Render user message
  if (message.role === 'user') {
    return (
      <UserMessage
        message={message}
        isLastInGroup={isLastInGroup}
      />
    );
  }

  // Render assistant message
  if (message.role === 'assistant') {
    return (
      <AssistantMessage
        message={message}
        onRegenerate={onRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
      />
    );
  }

  return null;
}; 