import React from 'react';
import { ChatMessage } from '../../types';
import { LoadingMessage } from '../LoadingMessage';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  isNewMessageLoading: boolean;
  isRegenerating: boolean;
  animationTrigger?: string;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  shouldAnimate?: boolean; // Whether this message should have typewriter animation
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isNewMessageLoading,
  isRegenerating,
  animationTrigger,
  onRegenerate,
  showAvatar = true,
  isLastInGroup = true,
  shouldAnimate = false,
  }) => {
    // Show loading message for new messages at the bottom
    if (isNewMessageLoading && message.role === 'assistant' && !message.content) {
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
        key={animationTrigger || `${index}-${message.content?.length || 0}`}
        message={message}
        onRegenerate={onRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
        shouldAnimate={shouldAnimate}
        animationTrigger={animationTrigger}
      />
    );
  }

  return null;
}; 