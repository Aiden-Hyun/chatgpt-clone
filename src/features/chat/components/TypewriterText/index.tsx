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
  const renderCount = useRef(0);
  renderCount.current++;
  
  const [displayedText, setDisplayedText] = useState('');
  const [showCursorBlink, setShowCursorBlink] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Use refs to avoid stale closures
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cursorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(0);
  const isCompleteRef = useRef(false);
  
  // Track the target text to prevent restarting animation on content updates
  const targetTextRef = useRef<string>('');
  const animationStartedRef = useRef(false);

  // Reset when text changes - optimized for regeneration scenarios
  useEffect(() => {
    // Force complete reset if text is completely different (likely regeneration)
    const isTextCompleteDiff = targetTextRef.current && text && 
                              (text !== targetTextRef.current && !text.startsWith(targetTextRef.current));
                              
    if (isTextCompleteDiff) {
      // This is likely a regeneration - force a complete restart
      
    }
    
    // Only restart if text has actually changed
    if (!isTextCompleteDiff && animationStartedRef.current && text && targetTextRef.current && 
        text.startsWith(targetTextRef.current)) {
      targetTextRef.current = text;
      return; // Don't restart animation for streaming updates
    }

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
    animationStartedRef.current = false;
    targetTextRef.current = text || '';

    // Only start animation if text exists and startAnimation is true
    if (text && text.length > 0 && startAnimation) {

      setIsAnimating(true);
      currentIndexRef.current = 0;
      animationStartedRef.current = true;
      
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
        const currentTargetText = targetTextRef.current;
        
        if (currentIndex < currentTargetText.length && !isCompleteRef.current) {
          setDisplayedText(currentTargetText.slice(0, currentIndex + 1));
          currentIndexRef.current++;
          
          timeoutRef.current = setTimeout(typeNext, speed);
        } else {
          // Animation complete
          
          setIsAnimating(false);
          isCompleteRef.current = true;
          animationStartedRef.current = false;
          
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
  }, [text, speed, showCursor, startAnimation]); // Only depend on props, not state - text change will trigger animation restart
  
  // Removed excessive prop change debugging that was running on every render

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
