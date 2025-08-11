import React from 'react';
import { ChatMessage } from '../../types';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingMessage } from '../LoadingMessage';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

interface MessageItemProps {
  message: ChatMessage;
  index: number;
  isNewMessageLoading: boolean;
  isRegenerating: boolean;
  onRegenerate?: () => void;
  onUserEditRegenerate?: (index: number, newText: string) => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  isNewMessageLoading,
  isRegenerating,
  onRegenerate,
  onUserEditRegenerate,
  showAvatar = true,
  isLastInGroup = true,
  }) => {
    // Use message state for assistant messages instead of external loading flags
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

    // Backward compatibility: Show loading for legacy patterns
    if ((isNewMessageLoading && message.role === 'assistant' && !message.content) ||
        (isRegenerating && message.role === 'assistant')) {
      return <LoadingMessage />;
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
        key={`assistant-${index}`}
        message={message}
        onRegenerate={onRegenerate}
        showAvatar={showAvatar}
        isLastInGroup={isLastInGroup}
      />
    );
  }

  return null;
}; 