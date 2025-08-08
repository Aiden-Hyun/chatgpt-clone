import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { ChatMessage } from '../../types';
import { MessageInteractionBar } from '../MessageInteractionBar';
import { createAssistantMessageStyles } from './AssistantMessage.styles';

interface AssistantMessageProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  shouldAnimate?: boolean; // Track if this message should have typewriter animation
}

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  message,
  onRegenerate,
  showAvatar = true,
  isLastInGroup = true,
  shouldAnimate = false,
}) => {
  const [showRegenerateButton, setShowRegenerateButton] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationStartedRef = useRef(false);
  const styles = createAssistantMessageStyles();

  // Typewriter animation effect
  useEffect(() => {
    if (shouldAnimate && message.content && !isAnimating && !animationStartedRef.current) {
      // Only animate if the message has substantial content and is completed
      if (message.content.trim().length > 0) {
        animationStartedRef.current = true;
        setIsAnimating(true);
        setDisplayedContent('');
        
        const typewriterSpeed = 35; // milliseconds per character
        const characters = message.content.split('');
        let currentIndex = 0;

        const typeNextChar = () => {
          if (currentIndex < characters.length) {
            const newContent = characters.slice(0, currentIndex + 1).join('');
            setDisplayedContent(newContent);
            currentIndex++;
            setTimeout(typeNextChar, typewriterSpeed);
          } else {
            setIsAnimating(false);
            setShowCursor(false);
            animationStartedRef.current = false; // Reset for next animation
            if (cursorIntervalRef.current) {
              clearInterval(cursorIntervalRef.current);
            }
          }
        };

        // Start blinking cursor
        setShowCursor(true);
        cursorIntervalRef.current = setInterval(() => {
          setShowCursor(prev => !prev);
        }, 500);

        // Start typewriter effect
        typeNextChar();
      }
    } else if (!shouldAnimate) {
      // For existing messages, show full content immediately
      setDisplayedContent(message.content);
      setIsAnimating(false);
    }
  }, [shouldAnimate]); // Removed isAnimating from dependencies to prevent infinite loop

  // Cleanup cursor interval
  useEffect(() => {
    return () => {
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  // Show animated content if currently animating, otherwise show full content
  const displayText = isAnimating ? displayedContent : message.content;

  return (
    <View style={[styles.container, !isLastInGroup && styles.compact]}>
      <Text style={styles.text}>
        {displayText}
        {shouldAnimate && isAnimating && showCursor && (
          <Text style={styles.cursor}>|</Text>
        )}
      </Text>
      
      {/* Interaction bar for AI messages */}
      {message.content && !isAnimating && (
        <MessageInteractionBar
          onRegenerate={onRegenerate}
          onLike={() => console.log('Like pressed')}
          onDislike={() => console.log('Dislike pressed')}
          onShare={() => console.log('Share pressed')}
          onCopy={() => console.log('Copy pressed')}
          onAudio={() => console.log('Audio pressed')}
        />
      )}
    </View>
  );
}; 