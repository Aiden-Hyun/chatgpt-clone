import React from 'react';
import { Text, View } from 'react-native';
import { useAppTheme } from '../../../business/theme/theme';
import { ChatMessage } from '../../types';

interface SystemMessageProps {
  message: ChatMessage;
}

export const SystemMessage: React.FC<SystemMessageProps> = ({ message }) => {
  const theme = useAppTheme();
  
  const styles = {
    container: {
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.xs,
    },
    messageContainer: {
      backgroundColor: theme.colors.background.secondary,
      borderRadius: theme.borders.radius.round,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderWidth: 0,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    text: {
      fontSize: theme.typography.fontSizes.sm,
              fontFamily: theme.typography.fontFamily.primary,
      color: theme.colors.text.secondary,
              fontWeight: theme.typography.fontWeights.medium as '500',
      textAlign: 'center' as const,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.text}>{message.content}</Text>
      </View>
    </View>
  );
};
