
import { Button, FormWrapper, Input, Text } from '@/components';
import { useToast } from '@/features/alert';
import { usePasswordReset } from '@/features/auth/hooks';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { getButtonSize, getHeaderHeight } from '@/shared/utils/layout';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import createForgotPasswordStyles from './forgot-password.styles';

export default function ForgotPasswordScreen() {
  const { t } = useLanguageContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);

  const { resetPassword, isLoading } = usePasswordReset();
  const { showError } = useToast();

  const theme = useAppTheme();
  const styles = createForgotPasswordStyles(theme);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    try {
      if (!email) {
        showError(t('auth.enter_email'));
        return;
      }

      if (!validateEmail(email)) {
        showError(t('auth.enter_valid_email'));
        return;
      }

      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert(
          'Success', 
          'Password reset email sent. Please check your email and follow the instructions.',
          [{ text: 'OK', onPress: async () => {
            try {
              router.replace('/signin');
            } catch {
              console.error('Navigation error:');
              setHasError(true);
            }
          }}]
        );
      } else {
        setHasError(true);
        showError(t('auth.unexpected_error'));
      }
    } catch {
      setHasError(true);
      showError(t('auth.unexpected_error'));
    }
  };

  const handleGoBack = async () => {
    try {
      const canGoBack = (router as any).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/auth');
      }
    } catch (fallbackError) {
      console.error('Navigation error:', fallbackError);
      setHasError(true);
    }
  };

  // Error state
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text variant="h2" weight="semibold" style={{ marginBottom: 20 }}>Something went wrong</Text>
        <Button 
          label="Try Again"
          onPress={() => setHasError(false)}
          variant="primary"
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Header with Back Button */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        paddingTop: getHeaderHeight(), // Use utility instead of platform-specific logic
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
      }}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={{
            padding: theme.spacing.sm,
            marginRight: theme.spacing.md,
            // Use consistent button size for all platforms
            minWidth: getButtonSize('action'),
            minHeight: getButtonSize('action'),
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold" style={{ flex: 1, textAlign: 'center', marginRight: getButtonSize('header') }}>
          Reset Password
        </Text>
      </View>

      <View style={styles.container}>
        <Text variant="body"
          style={{
            fontSize: theme.fontSizes.md,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
            lineHeight: 24,
          }}
        >
          Enter your email address and we'll send you a link to reset your password.
        </Text>

        <FormWrapper onSubmit={handleResetPassword} style={{ width: '100%' }}>
          <Input
            placeholder={t('auth.email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            variant="filled"
            returnKeyType="done"
            onSubmitEditing={handleResetPassword}
            blurOnSubmit={false}
          />
          
          <Button
            variant="primary"
            size="lg"
            label={isLoading ? t('auth.sending') : t('auth.reset_password')}
            onPress={handleResetPassword}
            disabled={isLoading}
            isLoading={isLoading}
            fullWidth
            containerStyle={{ marginTop: theme.spacing.lg }}
          />
        </FormWrapper>
        
        <Button
          variant="link"
          size="md"
          label={t('auth.back_to_signin')}
          onPress={() => router.replace('/signin')}
          disabled={isLoading}
          containerStyle={{ marginTop: theme.spacing.sm }}
        />
      </View>
    </View>
  );
} 