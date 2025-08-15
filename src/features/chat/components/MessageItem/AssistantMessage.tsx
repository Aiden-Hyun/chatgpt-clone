import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../../theme/theme';
import { TYPING_ANIMATION_SPEED, TYPING_ANIMATION_CHUNK_SIZE } from '../../constants';
import { ChatMessage } from '../../types';
import { MarkdownRenderer } from '../MarkdownRenderer';
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
  
  const [displayedContent, setDisplayedContent] = useState('');
  const isAnimating = message.state === 'animating';
  const fullContent = message.fullContent || '';

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (isAnimating) {
      currentIndexRef.current = 0;
      setDisplayedContent('');
      
      const type = () => {
        if (currentIndexRef.current >= fullContent.length) {
          return;
        }
  
        let nextIndex = currentIndexRef.current;
        const currentChar = fullContent[nextIndex];
  
        if (/\s/.test(currentChar)) {
          while (nextIndex < fullContent.length && /\s/.test(fullContent[nextIndex])) {
            nextIndex++;
          }
        } else {
          nextIndex = Math.min(fullContent.length, nextIndex + TYPING_ANIMATION_CHUNK_SIZE);
        }
  
        setDisplayedContent(fullContent.slice(0, nextIndex));
        currentIndexRef.current = nextIndex;
  
        if (nextIndex < fullContent.length) {
          timeoutRef.current = setTimeout(type, TYPING_ANIMATION_SPEED);
        }
      };
      
      timeoutRef.current = setTimeout(type, TYPING_ANIMATION_SPEED);
    } else {
      setDisplayedContent(fullContent);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAnimating, fullContent]);


  // Row renders substring provided by central orchestrator. When animating, show cursor.
  // Prefer content for live animation; fall back to fullContent once completed/hydrated
  const contentToShow = isAnimating ? displayedContent : (message.content || message.fullContent || '');

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <MarkdownRenderer isAnimating={isAnimating}>
        {contentToShow}
      </MarkdownRenderer>

      {/* Message interaction bar - always show for assistant messages */}
      {isLastInGroup && !isAnimating && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
        />
      )}
    </View>
  );
});