import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';

import { Button } from '../../components/ui/Button';
import { SocialAuthButtonsProps } from '../../interfaces/auth';
import { useLanguageContext } from '../../language/LanguageContext';
import { useAppTheme } from '../../theme/hooks/useTheme';
import { useSocialAuth } from '../hooks/useSocialAuth';

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onSuccess,
  onError,
  onRequiresAdditionalInfo
}) => {
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const { 
    authenticateWithGoogle, 
    authenticateWithGitHub, 
    authenticateWithMicrosoft, 
    authenticateWithApple,
    isLoading 
  } = useSocialAuth();

  const handleSocialAuth = async (provider: string, authFunction: () => Promise<Record<string, unknown>>) => {
    try {
      const result = await authFunction();
      
      if (result.success) {
        onSuccess?.(provider);
      } else if (result.requiresAdditionalInfo) {
        onRequiresAdditionalInfo?.(provider, result.providerData);
      } else {
        onError?.(provider, result.error || 'Authentication failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError?.(provider, `Authentication failed: ${errorMessage}`);
    }
  };

  return (
    <View style={{ gap: 12 }}>
      {/* Google Sign In */}
      <Button
        variant="outline"
        size="lg"
        leftIcon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
        label={t('auth.sign_in_with_google')}
        onPress={() => handleSocialAuth('google', authenticateWithGoogle)}
        disabled={isLoading}
        containerStyle={{
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.primary
        }}
      />

      {/* GitHub Sign In */}
      <Button
        variant="outline"
        size="lg"
        leftIcon={<Ionicons name="logo-github" size={20} color="#333" />}
        label={t('auth.sign_in_with_github')}
        onPress={() => handleSocialAuth('github', authenticateWithGitHub)}
        disabled={isLoading}
        containerStyle={{
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.primary
        }}
      />

      {/* Microsoft Sign In */}
      <Button
        variant="outline"
        size="lg"
        leftIcon={<Ionicons name="logo-microsoft" size={20} color="#00A4EF" />}
        label={t('auth.sign_in_with_microsoft')}
        onPress={() => handleSocialAuth('microsoft', authenticateWithMicrosoft)}
        disabled={isLoading}
        containerStyle={{
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.primary
        }}
      />

      {/* Apple Sign In */}
      <Button
        variant="outline"
        size="lg"
        leftIcon={<Ionicons name="logo-apple" size={20} color="#000" />}
        label={t('auth.sign_in_with_apple')}
        onPress={() => handleSocialAuth('apple', authenticateWithApple)}
        disabled={isLoading}
        containerStyle={{
          borderColor: theme.colors.border.primary,
          backgroundColor: theme.colors.background.primary
        }}
      />
    </View>
  );
};
