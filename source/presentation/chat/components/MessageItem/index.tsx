import React from 'react';

import { MessageItemProps } from '../../../interfaces/chat';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingMessage } from '../LoadingMessage';

import { AssistantMessage } from './AssistantMessage';
import { SystemMessage } from './SystemMessage';
import { UserMessage } from './UserMessage';

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isRegenerating,
  onRegenerate,
  onUserEditRegenerate,
  isLastInGroup = true,
  onLike,
  onDislike,
  }) => {
    // ✅ STATE MACHINE: Use message state for all rendering decisions
    if (message.role === 'assistant') {
      switch (message.state) {
        case 'loading':
          return <LoadingMessage />;
        case 'error':
          return (
            <ErrorMessage 
              message={message} 
              onRetry={() => {
                if (onRegenerate) {
                  onRegenerate();
                }
              }} 
            />
          );
        // Continue to render logic below for 'animating', 'completed', 'hydrated' states
      }
    }

    // ✅ STATE MACHINE: Backward compatibility for regeneration by index
    if (isRegenerating && message.role === 'assistant') {
      return <LoadingMessage />;
    }

  // Render system message
  if (message.role === 'system') {
    return <SystemMessage message={message} />;
  }

  // Render user message
  if (message.role === 'user') {
    return (
      <UserMessage
        message={message}
        isLastInGroup={isLastInGroup}
        onSendEdited={(newText: string) => onUserEditRegenerate?.(index, newText)}
      />
    );
  }

  // Render assistant message
  if (message.role === 'assistant') {
    // Debug logging removed for performance

    return (
      <AssistantMessage
        message={message}
        onRegenerate={onRegenerate}
        isLastInGroup={isLastInGroup}
        onLike={onLike}
        onDislike={onDislike}
      />
    );
  }

  return null;
}; 