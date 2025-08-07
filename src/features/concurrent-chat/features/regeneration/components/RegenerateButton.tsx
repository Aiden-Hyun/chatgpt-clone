import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { useMessageRegeneration } from '../useMessageRegeneration';

interface RegenerateButtonProps {
  messageId: string;
  originalContent: string;
  eventBus: EventBus;
  serviceContainer: ServiceContainer;
  onRegenerationStart?: () => void;
  onRegenerationComplete?: (newContent: string) => void;
  onRegenerationError?: (error: string) => void;
  style?: any;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
}

/**
 * RegenerateButton - Component for regenerating AI message responses
 * 
 * Features:
 * - Regenerate AI responses with different variations
 * - Loading states with animated indicators
 * - Error handling with retry options
 * - Multiple size and variant options
 * - Integration with regeneration service
 * - Event-driven regeneration process
 */
export const RegenerateButton: React.FC<RegenerateButtonProps> = ({
  messageId,
  originalContent,
  eventBus,
  serviceContainer,
  onRegenerationStart,
  onRegenerationComplete,
  onRegenerationError,
  style,
  disabled = false,
  size = 'medium',
  variant = 'primary',
}) => {
  const {
    isInitialized,
    isLoading,
    error: regenerationError,
    regenerateMessage,
    canRegenerate,
    getRegenerationHistory,
    clearRegenerationHistory,
  } = useMessageRegeneration(eventBus, serviceContainer);

  // Handle regeneration button press
  const handleRegenerate = useCallback(async () => {
    if (!isInitialized || isLoading || disabled || !canRegenerate(messageId)) {
      return;
    }

    try {
      onRegenerationStart?.();
      
      const newContent = await regenerateMessage(messageId, originalContent);
      
      onRegenerationComplete?.(newContent);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Regeneration failed';
      onRegenerationError?.(errorMessage);
    }
  }, [
    messageId,
    originalContent,
    isInitialized,
    isLoading,
    disabled,
    canRegenerate,
    regenerateMessage,
    onRegenerationStart,
    onRegenerationComplete,
    onRegenerationError,
  ]);

  // Determine if button should be disabled
  const isButtonDisabled = disabled || isLoading || !isInitialized || !canRegenerate(messageId);

  // Get button text based on state
  const getButtonText = () => {
    if (isLoading) {
      return '🔄 Regenerating...';
    }
    if (regenerationError) {
      return '⚠️ Retry';
    }
    return '🔄 Regenerate';
  };

  // Get button style based on variant and size
  const getButtonStyle = () => {
    const baseStyle = [
      styles.button,
      styles[`${variant}Button`],
      styles[`${size}Button`],
      isButtonDisabled && styles.disabledButton,
      style,
    ];

    return baseStyle;
  };

  // Get text style based on variant and size
  const getTextStyle = () => {
    const baseStyle = [
      styles.text,
      styles[`${variant}Text`],
      styles[`${size}Text`],
      isButtonDisabled && styles.disabledText,
    ];

    return baseStyle;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handleRegenerate}
        disabled={isButtonDisabled}
        activeOpacity={0.7}
      >
        <Text style={getTextStyle()}>
          {getButtonText()}
        </Text>
      </TouchableOpacity>

      {/* Error display */}
      {regenerationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {regenerationError}
          </Text>
        </View>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            Generating new response...
          </Text>
        </View>
      )}

      {/* Debug info (only in development) */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            ID: {messageId} | Can Regenerate: {canRegenerate(messageId).toString()} | 
            History: {getRegenerationHistory(messageId).length} | 
            Initialized: {isInitialized.toString()}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  // Size variants
  smallButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minHeight: 32,
  },
  mediumButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  largeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
  },
  // Color variants
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  secondaryButton: {
    backgroundColor: '#F2F2F7',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  disabledButton: {
    backgroundColor: '#E5E5EA',
    opacity: 0.6,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  // Text sizes
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  // Text colors
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  outlineText: {
    color: '#007AFF',
  },
  disabledText: {
    color: '#8E8E93',
  },
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
  loadingContainer: {
    marginTop: 4,
    padding: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
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