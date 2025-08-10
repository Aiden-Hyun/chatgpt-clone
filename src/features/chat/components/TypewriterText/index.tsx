import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

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
  speed = 50,
  showCursor = true,
  cursorChar = '|',
  style,
  onComplete,
  startAnimation = true,
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursorBlink, setShowCursorBlink] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Use refs to avoid stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const isCompleteRef = useRef(false);

  // Reset when text changes
  useEffect(() => {
    // Clear any existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (cursorIntervalRef.current) {
      clearInterval(cursorIntervalRef.current);
      cursorIntervalRef.current = null;
    }

    // Reset state
    setDisplayedText('');
    setIsAnimating(false);
    setShowCursorBlink(false);
    currentIndexRef.current = 0;
    isCompleteRef.current = false;

    // Only start animation if text exists and startAnimation is true
    if (text && text.length > 0 && startAnimation) {
      setIsAnimating(true);
      currentIndexRef.current = 0;
      
      // Start cursor blinking
      if (showCursor) {
        setShowCursorBlink(true);
        cursorIntervalRef.current = setInterval(() => {
          setShowCursorBlink(prev => !prev);
        }, 500);
      }

      // Start typewriter effect
      const typeNext = () => {
        const currentIndex = currentIndexRef.current;
        
        if (currentIndex < text.length && !isCompleteRef.current) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndexRef.current++;
          
          timeoutRef.current = setTimeout(typeNext, speed);
        } else {
          // Animation complete
          setIsAnimating(false);
          isCompleteRef.current = true;
          
          // Stop cursor blinking after animation
          if (cursorIntervalRef.current) {
            clearInterval(cursorIntervalRef.current);
            cursorIntervalRef.current = null;
          }
          setShowCursorBlink(false);
          
          // Call completion callback
          if (onComplete) {
            onComplete();
          }
        }
      };

      // Start the animation
      timeoutRef.current = setTimeout(typeNext, speed);
    } else {
      // If not animating, show full text immediately
      setDisplayedText(text);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
        cursorIntervalRef.current = null;
      }
    };
  }, [text, speed, showCursor, startAnimation]); // Only depend on props, not state

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (cursorIntervalRef.current) {
        clearInterval(cursorIntervalRef.current);
      }
    };
  }, []);

  return (
    <Text style={[styles.text, style]}>
      {displayedText}
      {isAnimating && showCursor && showCursorBlink && (
        <Text style={styles.cursor}>{cursorChar}</Text>
      )}
    </Text>
  );
});

const styles = StyleSheet.create({
  text: {
    // Default styles
  },
  cursor: {
    // Cursor styles
  },
});
