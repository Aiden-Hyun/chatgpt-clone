import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import MarkdownDisplay from 'react-native-markdown-display';
import { TYPING_ANIMATION_SPEED } from '../../constants';

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
      // Find the end of the current block of non-whitespace characters (the "word")
      while (nextIndex < text.length && !/\s/.test(text[nextIndex])) {
        nextIndex++;
      }

      // If we are at a whitespace, it means the "word" was empty. We should advance at least one character.
      if (nextIndex === currentIndexRef.current) {
        nextIndex++;
      }

      // Now, include all subsequent whitespace characters
      while (nextIndex < text.length && /\s/.test(text[nextIndex])) {
        nextIndex++;
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
