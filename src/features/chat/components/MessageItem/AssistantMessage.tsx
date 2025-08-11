import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../../theme/lib/theme';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { TypewriterText } from '../TypewriterText';
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
  const styles = React.useMemo(() => createAssistantMessageStyles(theme), [theme]);

  // State-based rendering: use message.state to determine behavior
  const useAnimation = message.state === 'animating';
  const contentToShow = message.state === 'animating' 
    ? (message.fullContent || message.content) 
    : message.content;

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      {useAnimation ? (
        <TypewriterText
          text={contentToShow}
          startAnimation={true}
          speed={35}
          showCursor={true}
          style={styles.text}
          onComplete={() => {
            // Transition to completed state when animation finishes
            if (message.id) {
              // TODO: Add state manager call here when we have access to it
              // messageStateManager.markCompleted(message.id);
            }
          }}
        />
      ) : (
        <Text style={styles.text}>
          {contentToShow}
        </Text>
      )}

      {/* Message interaction bar - always show for assistant messages */}
      {isLastInGroup && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
        />
      )}
    </View>
  );
});