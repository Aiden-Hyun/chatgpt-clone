import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { LoadingScreenProps } from '../interfaces/components';
import { useAppTheme } from '../theme/hooks/useTheme';

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message, 
  size = 'large',
  fullScreen = true 
}) => {
  console.log('🔍 LoadingScreen: Rendering with props:', { message, size, fullScreen });
  
  const theme = useAppTheme();
  console.log('🔍 LoadingScreen: Theme:', !!theme);

  const containerStyle = {
    flex: fullScreen ? 1 : undefined,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.primary,
    padding: fullScreen ? theme.spacing.xxl : theme.spacing.lg,
  };

  const messageStyle = {
    fontSize: theme.typography.fontSizes.md,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.lg,
    textAlign: 'center' as const,
    fontFamily: theme.typography.fontFamily.primary,
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