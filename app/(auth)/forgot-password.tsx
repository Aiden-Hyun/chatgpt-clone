
import { FormWrapper } from '@/components';
import { Button, Input, Text } from '@/components/ui';
import { useToast } from '@/features/alert';
import { usePasswordReset } from '@/features/auth/hooks';
import { LanguageSelector, useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, View, TouchableOpacity, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { createForgotPasswordStyles } from './forgot-password.styles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);
  const { resetPassword, isLoading } = usePasswordReset();
  const { showError } = useToast();
  const { t } = useLanguageContext();

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
        paddingTop: Platform.OS === 'ios' ? theme.spacing.md + 44 : theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.primary,
      }}>
        <TouchableOpacity 
          onPress={handleGoBack} 
          style={{
            padding: theme.spacing.sm,
            marginRight: theme.spacing.md,
          }}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text variant="h3" weight="semibold" style={{ flex: 1, textAlign: 'center', marginRight: 40 }}>
          Reset Password
        </Text>
      </View>

      <View style={styles.container}>
        <Text variant="body" style={styles.description}>
          Enter your email address and we will send you a link to reset your password.
        </Text>
        
        <FormWrapper onSubmit={handleResetPassword} style={{ width: '100%' }}>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
            variant="filled"
            onFocus={() => console.log('Email input focused on forgot-password')}
            onBlur={() => console.log('Email input blurred on forgot-password')}
          />
        </FormWrapper>
        
        <Button 
          label={isLoading ? 'Sending...' : 'Send Reset Link'}
          onPress={handleResetPassword}
          disabled={isLoading}
          isLoading={isLoading}
          fullWidth
          containerStyle={styles.button}
        />
      </View>
    </View>
  );
} 