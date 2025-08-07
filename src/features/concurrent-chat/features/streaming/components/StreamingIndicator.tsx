import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { useMessageStreaming } from '../useMessageStreaming';

interface StreamingIndicatorProps {
  messageId: string;
  eventBus: EventBus;
  serviceContainer: ServiceContainer;
  onStreamingStart?: () => void;
  onStreamingComplete?: () => void;
  onStreamingError?: (error: string) => void;
  style?: any;
  size?: 'small' | 'medium' | 'large';
  variant?: 'dots' | 'pulse' | 'wave' | 'typing';
  color?: string;
  speed?: 'slow' | 'normal' | 'fast';
}

/**
 * StreamingIndicator - Component for displaying streaming indicators
 * 
 * Features:
 * - Multiple animation variants (dots, pulse, wave, typing)
 * - Configurable size and speed
 * - Real-time streaming status
 * - Integration with streaming service
 * - Event-driven streaming process
 * - Smooth animations with React Native Animated API
 */
export const StreamingIndicator: React.FC<StreamingIndicatorProps> = ({
  messageId,
  eventBus,
  serviceContainer,
  onStreamingStart,
  onStreamingComplete,
  onStreamingError,
  style,
  size = 'medium',
  variant = 'dots',
  color = '#007AFF',
  speed = 'normal',
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [progress, setProgress] = useState(0);
  
  // Animation refs
  const dotAnimations = useRef<Animated.Value[]>([]).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const waveAnimation = useRef(new Animated.Value(0)).current;
  const typingAnimation = useRef(new Animated.Value(0)).current;

  const {
    isInitialized,
    isLoading,
    error: streamingError,
    isStreaming: serviceIsStreaming,
    getStreamingProgress,
    getStreamingText,
    startStreaming,
    stopStreaming,
    pauseStreaming,
    resumeStreaming,
  } = useMessageStreaming(eventBus, serviceContainer);

  // Initialize dot animations
  useEffect(() => {
    if (variant === 'dots') {
      const dots = Array.from({ length: 3 }, () => new Animated.Value(0));
      dotAnimations.splice(0, dotAnimations.length, ...dots);
    }
  }, [variant, dotAnimations]);

  // Handle streaming state changes
  useEffect(() => {
    if (serviceIsStreaming(messageId)) {
      setIsStreaming(true);
      onStreamingStart?.();
    } else {
      setIsStreaming(false);
      onStreamingComplete?.();
    }
  }, [messageId, serviceIsStreaming, onStreamingStart, onStreamingComplete]);

  // Handle streaming errors
  useEffect(() => {
    if (streamingError) {
      onStreamingError?.(streamingError);
    }
  }, [streamingError, onStreamingError]);

  // Update streaming text and progress
  useEffect(() => {
    if (isStreaming) {
      const text = getStreamingText(messageId);
      const progressValue = getStreamingProgress(messageId);
      
      setStreamingText(text);
      setProgress(progressValue);
    }
  }, [isStreaming, messageId, getStreamingText, getStreamingProgress]);

  // Animation effects
  useEffect(() => {
    if (!isStreaming) return;

    const speedMultiplier = {
      slow: 1.5,
      normal: 1,
      fast: 0.5,
    }[speed];

    switch (variant) {
      case 'dots':
        // Animate dots in sequence
        dotAnimations.forEach((dot, index) => {
          Animated.loop(
            Animated.sequence([
              Animated.delay(index * 200 * speedMultiplier),
              Animated.timing(dot, {
                toValue: 1,
                duration: 400 * speedMultiplier,
                useNativeDriver: true,
              }),
              Animated.timing(dot, {
                toValue: 0,
                duration: 400 * speedMultiplier,
                useNativeDriver: true,
              }),
            ])
          ).start();
        });
        break;

      case 'pulse':
        // Pulse animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 1.2,
              duration: 600 * speedMultiplier,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 600 * speedMultiplier,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;

      case 'wave':
        // Wave animation
        Animated.loop(
          Animated.timing(waveAnimation, {
            toValue: 1,
            duration: 1000 * speedMultiplier,
            useNativeDriver: true,
          })
        ).start();
        break;

      case 'typing':
        // Typing animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(typingAnimation, {
              toValue: 1,
              duration: 800 * speedMultiplier,
              useNativeDriver: true,
            }),
            Animated.timing(typingAnimation, {
              toValue: 0,
              duration: 800 * speedMultiplier,
              useNativeDriver: true,
            }),
          ])
        ).start();
        break;
    }

    return () => {
      // Cleanup animations when component unmounts or streaming stops
      dotAnimations.forEach(dot => dot.stopAnimation());
      pulseAnimation.stopAnimation();
      waveAnimation.stopAnimation();
      typingAnimation.stopAnimation();
    };
  }, [isStreaming, variant, speed, dotAnimations, pulseAnimation, waveAnimation, typingAnimation]);

  // Render dots variant
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {dotAnimations.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            styles[`${size}Dot`],
            { backgroundColor: color },
            {
              opacity: dot,
              transform: [{ scale: dot }],
            },
          ]}
        />
      ))}
    </View>
  );

  // Render pulse variant
  const renderPulse = () => (
    <Animated.View
      style={[
        styles.pulse,
        styles[`${size}Pulse`],
        { backgroundColor: color },
        {
          transform: [{ scale: pulseAnimation }],
        },
      ]}
    />
  );

  // Render wave variant
  const renderWave = () => (
    <View style={styles.waveContainer}>
      {Array.from({ length: 3 }, (_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.waveBar,
            styles[`${size}WaveBar`],
            { backgroundColor: color },
            {
              transform: [
                {
                  scaleY: waveAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );

  // Render typing variant
  const renderTyping = () => (
    <View style={styles.typingContainer}>
      <Text style={[styles.typingText, styles[`${size}TypingText`], { color }]}>
        {streamingText || 'Typing'}
      </Text>
      <Animated.View
        style={[
          styles.cursor,
          styles[`${size}Cursor`],
          { backgroundColor: color },
          {
            opacity: typingAnimation,
          },
        ]}
      />
    </View>
  );

  // Render progress bar
  const renderProgress = () => (
    <View style={styles.progressContainer}>
      <View style={[styles.progressBar, styles[`${size}ProgressBar`]]}>
        <View
          style={[
            styles.progressFill,
            { backgroundColor: color, width: `${progress * 100}%` },
          ]}
        />
      </View>
      <Text style={[styles.progressText, styles[`${size}ProgressText`]]}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );

  // Determine which variant to render
  const renderVariant = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'wave':
        return renderWave();
      case 'typing':
        return renderTyping();
      default:
        return renderDots();
    }
  };

  if (!isInitialized || !isStreaming) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      {/* Main indicator */}
      <View style={styles.indicatorContainer}>
        {renderVariant()}
      </View>

      {/* Progress bar */}
      {progress > 0 && progress < 1 && (
        <View style={styles.progressWrapper}>
          {renderProgress()}
        </View>
      )}

      {/* Error display */}
      {streamingError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {streamingError}
          </Text>
        </View>
      )}

      {/* Debug info (only in development) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            ID: {messageId} | Streaming: {isStreaming.toString()} | 
            Progress: {Math.round(progress * 100)}% | 
            Variant: {variant} | Speed: {speed}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 8,
  },
  indicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Dots variant
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    borderRadius: 4,
  },
  smallDot: {
    width: 6,
    height: 6,
  },
  mediumDot: {
    width: 8,
    height: 8,
  },
  largeDot: {
    width: 10,
    height: 10,
  },
  // Pulse variant
  pulse: {
    borderRadius: 20,
  },
  smallPulse: {
    width: 12,
    height: 12,
  },
  mediumPulse: {
    width: 16,
    height: 16,
  },
  largePulse: {
    width: 20,
    height: 20,
  },
  // Wave variant
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  waveBar: {
    borderRadius: 2,
  },
  smallWaveBar: {
    width: 3,
    height: 12,
  },
  mediumWaveBar: {
    width: 4,
    height: 16,
  },
  largeWaveBar: {
    width: 5,
    height: 20,
  },
  // Typing variant
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingText: {
    fontWeight: '500',
  },
  smallTypingText: {
    fontSize: 12,
  },
  mediumTypingText: {
    fontSize: 14,
  },
  largeTypingText: {
    fontSize: 16,
  },
  cursor: {
    width: 2,
  },
  smallCursor: {
    height: 12,
  },
  mediumCursor: {
    height: 16,
  },
  largeCursor: {
    height: 20,
  },
  // Progress
  progressWrapper: {
    marginTop: 8,
    width: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  smallProgressBar: {
    height: 4,
  },
  mediumProgressBar: {
    height: 6,
  },
  largeProgressBar: {
    height: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontWeight: '600',
  },
  smallProgressText: {
    fontSize: 10,
  },
  mediumProgressText: {
    fontSize: 12,
  },
  largeProgressText: {
    fontSize: 14,
  },
  // Error
  errorContainer: {
    marginTop: 4,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    textAlign: 'center',
  },
  // Debug
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