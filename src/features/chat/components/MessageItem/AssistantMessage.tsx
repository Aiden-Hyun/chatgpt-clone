import React from 'react';
import { Text, View } from 'react-native';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { TypewriterText } from '../TypewriterText';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  shouldAnimate?: boolean;
  animationTrigger?: string; // token to force-start animation when it changes
}

export const AssistantMessage: React.FC<AssistantMessageProps> = React.memo(function AssistantMessage({
  message,
  onRegenerate,
  showAvatar = true, // (kept for future use)
  isLastInGroup = true,
  shouldAnimate = false,
  animationTrigger,
}: AssistantMessageProps) {
  const styles = createAssistantMessageStyles();

  // Add render counter for performance monitoring (disabled)
  // const renderCountRef = React.useRef(0);
  // renderCountRef.current++;
  // if (renderCountRef.current % 5 === 0) {
  //   console.log(`[ASSISTANT-RENDER] Count: ${renderCountRef.current}`);
  // }

  // Simple logic: if we should animate and have content, use TypewriterText
  // Otherwise, just show the text directly
  const hasContent = message.content && message.content.trim().length > 0;
  const useAnimation = shouldAnimate && hasContent;

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      {useAnimation ? (
        <TypewriterText
          text={message.content}
          startAnimation={true}
          speed={35}
          showCursor={true}
          style={styles.text}
          onComplete={() => {
            // Animation completed
          }}
        />
      ) : (
        <Text style={styles.text}>
          {message.content}
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