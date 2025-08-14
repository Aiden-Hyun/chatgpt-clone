import React from 'react';
import { View } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { useAppTheme } from '../../../theme/theme';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
}

export const AssistantMessage: React.FC<AssistantMessageProps> = React.memo(function AssistantMessage({
  message,
  onRegenerate,
  showAvatar = true, // (kept for future use)
  isLastInGroup = true,
}: AssistantMessageProps) {
  const theme = useAppTheme();
  
  // Memoize styles to prevent re-creation on every render
  const styles = React.useMemo(() => createAssistantMessageStyles(theme), [theme]);
  

  // Row renders substring provided by central orchestrator. When animating, show cursor.
  const isAnimating = message.state === 'animating';
  // Prefer content for live animation; fall back to fullContent once completed/hydrated
  const contentToShow = message.content || message.fullContent || '';

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <MarkdownDisplay
        style={{
          body: styles.text,
          heading1: styles.heading1,
          heading2: styles.heading2,
          code_block: styles.code_block,
          fence: styles.fence,
          strong: styles.strong,
        }}
      >
        {`${contentToShow}${isAnimating ? '▍' : ''}`}
      </MarkdownDisplay>

      {/* Message interaction bar - always show for assistant messages */}
      {isLastInGroup && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
        />
      )}
    </View>
  );
});