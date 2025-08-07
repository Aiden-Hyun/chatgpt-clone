import React, { useEffect, useRef } from 'react';
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
    if (!isInitialized || !textRef.current || status !== 'completed') {
      return;
    }

    const startAnimation = async () => {
      try {
        onAnimationStart?.();
        
        // Determine animation strategy based on role
        const strategy = role === 'assistant' ? 'typewriter' : 'fadeIn';
        
        await animateMessage(messageId, content, strategy);
        
        onAnimationComplete?.();
      } catch (error) {
        console.error('Animation failed:', error);
      }
    };

    startAnimation();
  }, [messageId, content, role, status, isInitialized, animateMessage, onAnimationStart, onAnimationComplete]);

  // Determine display content based on status
  const getDisplayContent = () => {
    switch (status) {
      case 'pending':
        return '⏳ Preparing...';
      case 'processing':
        return role === 'assistant' ? '🤖 Thinking...' : '📤 Sending...';
      case 'failed':
        return '❌ Failed to send message';
      case 'completed':
        return content;
      default:
        return content;
    }
  };

  // Determine container style based on role and status
  const getContainerStyle = () => {
    const baseStyle = [
      styles.container,
      role === 'user' ? styles.userMessage : styles.assistantMessage,
      status === 'failed' && styles.failedMessage,
      style,
    ];

    return baseStyle;
  };

  // Determine text style based on role and status
  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      role === 'user' ? styles.userText : styles.assistantText,
      status === 'failed' && styles.failedText,
    ];

    return baseStyle;
  };

  return (
    <View ref={containerRef} style={getContainerStyle()}>
      <Text ref={textRef} style={getTextStyle()}>
        {getDisplayContent()}
      </Text>
      
      {/* Animation status indicator */}
      {isLoading && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>Animating...</Text>
        </View>
      )}
      
      {/* Animation error display */}
      {animationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Animation Error: {animationError}
          </Text>
        </View>
      )}
      
      {/* Debug info (only in development) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            ID: {messageId} | Role: {role} | Status: {status} | 
            Strategies: {availableStrategies.length} | Default: {defaultStrategy}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    marginLeft: '15%',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#F2F2F7',
    marginRight: '15%',
  },
  failedMessage: {
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#000000',
  },
  failedText: {
    color: '#D32F2F',
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