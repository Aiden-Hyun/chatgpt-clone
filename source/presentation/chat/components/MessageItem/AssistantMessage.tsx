import React from 'react';
import { Text, View } from 'react-native';

import { useToast } from '../../../alert/toast';
import { ChatMessage } from '../../../interfaces/chat';
import { useBusinessContext } from '../../../shared/BusinessContextProvider';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { useMessageActions } from '../../hooks/useMessageActions';

import { AssistantMessageBar } from '../AssistantMessageBar';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface IAssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  // Like/dislike handlers
  onLike?: (messageId: string) => void;
  onDislike?: (messageId: string) => void;
}

export const AssistantMessage: React.FC<IAssistantMessageProps> = React.memo(function AssistantMessage({
  message,
  onRegenerate,
  showAvatar = true, // (kept for future use)
  isLastInGroup = true,
  onLike,
  onDislike,
}: AssistantMessageProps) {
  const theme = useAppTheme();
  const { clipboard } = useBusinessContext();
  
  // Memoize styles to prevent re-creation on every render
  const styles = React.useMemo(() => createAssistantMessageStyles(theme), [theme]);
  const { showSuccess, showError } = useToast();
  const isAnimating = false; // Simplified for now
  const contentToShow = message.content || '';

  const handleLike = () => {
    if (message.id && onLike) {
      onLike(message.id);
    }
  };

  const handleDislike = () => {
    if (message.id && onDislike) {
      onDislike(message.id);
    }
  };

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <Text>{contentToShow}</Text>

      {/* Message interaction bar - always show for assistant messages */}
      {isLastInGroup && !isAnimating && (
        <AssistantMessageBar
          onRegenerate={onRegenerate}
          onLike={handleLike}
          onDislike={handleDislike}
          isLiked={false}
          isDisliked={false}
          onCopy={async () => {
            try {
              const result = await clipboard.copyToClipboard(message.content);
              if (result.success) {
                showSuccess('Copied to clipboard');
              } else {
                showError('Failed to copy');
              }
            } catch {
              showError('Failed to copy');
            }
          }}
        />
      )}
    </View>
  );
});