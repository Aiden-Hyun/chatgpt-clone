import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { TYPING_ANIMATION_SPEED, TYPING_ANIMATION_CHUNK_SIZE } from '../../constants';

interface TypewriterTextProps {
  text: string;
  speed?: number; // milliseconds per character
  showCursor?: boolean;
  cursorChar?: string;
  style?: any;
  onComplete?: () => void;
  startAnimation?: boolean;
}

/**
 * Simple, isolated typewriter animation component
 * No complex state management, no queues, just pure animation
 */
export const TypewriterText: React.FC<TypewriterTextProps> = React.memo(function TypewriterText({
  text,
  speed = TYPING_ANIMATION_SPEED,
  showCursor = true,
  cursorChar = '▍',
  style,
  onComplete,
  startAnimation = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAnimationComplete, setAnimationComplete] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);

  useEffect(() => {
    if (!startAnimation || !text) {
      setDisplayedText(text);
      setAnimationComplete(true);
      return;
    }

    setIsAnimating(true);
    setAnimationComplete(false);
    setDisplayedText('');
    currentIndexRef.current = 0;

    const type = () => {
      if (currentIndexRef.current >= text.length) {
        setIsAnimating(false);
        setAnimationComplete(true);
        if (onComplete) {
          onComplete();
        }
        return;
      }

      let nextIndex = currentIndexRef.current;
      const currentChar = text[nextIndex];

      if (/\s/.test(currentChar)) {
        // Find the end of the whitespace block
        while (nextIndex < text.length && /\s/.test(text[nextIndex])) {
          nextIndex++;
        }
      } else {
        // Advance by a chunk of characters to reduce re-render frequency
        nextIndex = Math.min(text.length, nextIndex + TYPING_ANIMATION_CHUNK_SIZE);
      }

      const textToDisplay = text.slice(0, nextIndex);
      setDisplayedText(textToDisplay);
      currentIndexRef.current = nextIndex;

      if (currentIndexRef.current < text.length) {
        timeoutRef.current = setTimeout(type, speed);
      } else {
        setIsAnimating(false);
        setAnimationComplete(true);
        if (onComplete) {
          onComplete();
        }
      }
    };

    timeoutRef.current = setTimeout(type, speed);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, startAnimation, onComplete]);

  const textToRender = isAnimating ? `${displayedText}${showCursor ? cursorChar : ''}` : displayedText;

  return (
    <MarkdownDisplay
      style={{
        body: style,
        ...style,
      }}
    >
      {textToRender}
    </MarkdownDisplay>
  );
});

const styles = StyleSheet.create({
  // Styles can be passed via props
});
