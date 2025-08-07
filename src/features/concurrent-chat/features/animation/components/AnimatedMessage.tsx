import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { useMessageAnimation } from '../useMessageAnimation';

interface AnimatedMessageProps {
  messageId: string;
  content: string;
  role: 'user' | 'assistant';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  eventBus: EventBus;
  serviceContainer: ServiceContainer;
  style?: any;
  onAnimationComplete?: () => void;
  onAnimationStart?: () => void;
}

/**
 * AnimatedMessage - Component for displaying messages with animations
 * 
 * Features:
 * - Typewriter animation for assistant messages
 * - Fade-in animation for user messages
 * - Loading states with animated indicators
 * - Error states with retry options
 * - Configurable animation strategies
 * - Real-time content updates
 */
export const AnimatedMessage: React.FC<AnimatedMessageProps> = ({
  messageId,
  content,
  role,
  status,
  eventBus,
  serviceContainer,
  style,
  onAnimationComplete,
  onAnimationStart,
}) => {
  const textRef = useRef<Text>(null);
  const containerRef = useRef<View>(null);
  const [displayedContent, setDisplayedContent] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  
  const {
    isInitialized,
    isLoading,
    error: animationError,
    animateMessage,
    registerAnimationElement,
    unregisterAnimationElement,
    availableStrategies,
    defaultStrategy,
  } = useMessageAnimation(eventBus, serviceContainer);

  // Register animation element when component mounts
  useEffect(() => {
    if (textRef.current && isInitialized) {
      // For React Native, we need to adapt the animation approach
      // since we can't directly access HTMLElement
      registerAnimationElement(messageId, textRef.current as any);
    }

    return () => {
      unregisterAnimationElement(messageId);
    };
  }, [messageId, isInitialized, registerAnimationElement, unregisterAnimationElement]);

  // Handle animation when content changes or status becomes completed
  useEffect(() => {
    if (!isInitialized || status !== 'completed') {
      return;
    }

    const startAnimation = async () => {
      try {
        setIsAnimating(true);
        onAnimationStart?.();
        
        // Determine animation strategy based on role
        const strategy = role === 'assistant' ? 'typewriter' : 'fadeIn';
        
        if (strategy === 'typewriter') {
          // Implement typewriter effect
          setDisplayedContent('');
          for (let i = 0; i <= content.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per character
            setDisplayedContent(content.substring(0, i));
          }
        } else {
          // For fade-in, just show the content immediately
          setDisplayedContent(content);
        }
        
        setIsAnimating(false);
        onAnimationComplete?.();
      } catch (error) {
        console.error('Animation failed:', error);
        setIsAnimating(false);
        setDisplayedContent(content); // Fallback to showing full content
      }
    };

    startAnimation();
  }, [messageId, content, role, status, isInitialized, onAnimationStart, onAnimationComplete]);

  // Determine display content based on status
  const getDisplayContent = () => {
    // User messages always show their content immediately
    if (role === 'user') {
      return content;
    }
    
    // Assistant messages use different display logic based on status
    switch (status) {
      case 'pending':
        return '⏳ Preparing...';
      case 'processing':
        return '🤖 Thinking...';
      case 'failed':
        return '❌ Failed to send message';
      case 'completed':
        // For assistant messages, only show animated content to prevent flash
        return displayedContent;
      default:
        return content;
    }
  };

  // Determine container style based on role and status
  const getContainerStyle = () => {
    const baseStyle = [
      role === 'user' ? styles.userMessage : styles.assistantMessage,
      status === 'failed' && styles.failedMessage,
    ];

    return baseStyle;
  };

  // Determine text style based on role and status
  const getTextStyle = () => {
    const baseStyle = [
      role === 'user' ? styles.userText : styles.assistantText,
      status === 'failed' && styles.failedText,
    ];

    return baseStyle;
  };

  return (
    <View style={styles.container}>
      <View ref={containerRef} style={[styles.messageBubble, getContainerStyle()]}>
        <Text ref={textRef} style={[styles.text, getTextStyle()]}>
          {getDisplayContent()}
        </Text>
        
        {/* Animation error display */}
        {animationError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>
              Animation Error: {animationError}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main message container with full width for proper alignment
  container: {
    width: '100%',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  
  // Message bubble container
  messageBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
    maxWidth: '75%',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  
  // User message styling (right aligned, blue)
  userMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  
  // Assistant message styling (left aligned, gray)
  assistantMessage: {
    backgroundColor: '#F8F9FA',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  
  // Failed message styling
  failedMessage: {
    backgroundColor: '#FFE6E6',
    borderWidth: 1,
    borderColor: '#FF4444',
    alignSelf: 'flex-start',
  },
  
  // Text styling
  text: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
  },
  
  userText: {
    color: '#FFFFFF',
  },
  
  assistantText: {
    color: '#1A1A1A',
  },
  
  failedText: {
    color: '#CC0000',
  },
  loadingIndicator: {
    marginTop: 4,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 4,
    padding: 4,
    backgroundColor: '#FFEBEE',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
  },
  debugContainer: {
    marginTop: 4,
    padding: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666666',
  },
}); 