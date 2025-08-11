// src/features/chat/components/ErrorMessage/index.tsx
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../../theme/lib/theme';
import { ChatMessage } from '../../types';
import { createErrorMessageStyles } from './ErrorMessage.styles';

interface ErrorMessageProps {
  message: ChatMessage;
  onRetry: () => void;
  style?: any;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry, style }) => {
  const theme = useAppTheme();
  const styles = createErrorMessageStyles(theme);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.errorContent}>
        <Text style={styles.errorText}>Failed to generate response</Text>
        <Text style={styles.errorSubtext}>Something went wrong. Please try again.</Text>
        
        <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
