import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAppTheme } from '../../hooks';

interface LoadingScreenProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  size = 'large',
  fullScreen = true 
}) => {
  const theme = useAppTheme();

  const containerStyle = {
    flex: fullScreen ? 1 : undefined,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.primary,
    padding: fullScreen ? theme.spacing.xxl : theme.spacing.lg,
  };

  const messageStyle = {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center' as const,
    fontFamily: theme.fontFamily.primary,
  };

  return (
    <View style={containerStyle}>
      <ActivityIndicator 
        size={size} 
        color={theme.colors.status.info.primary}
      />
      {message && (
        <Text style={messageStyle}>{message}</Text>
      )}
    </View>
  );
}; 