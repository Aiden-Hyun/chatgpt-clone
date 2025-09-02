/**
 * Login Page - Uses New Presentation Auth System
 * Located under /(public) route group
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';

import { useToast } from '../../alert/toast';
import { SocialAuthButtons } from '../../auth/components/SocialAuthButtons';
import { useAuth } from '../../auth/context/AuthContext';
import { useEmailSignin } from '../../auth/hooks/useEmailSignin';
import { FormWrapper, LoadingScreen } from '../../components';
import { Button, Input, Text } from '../../components/ui';
import { LanguageSelector, useLanguageContext } from '../../language';
import { useAppTheme } from '../../theme/hooks/useTheme';

import { createAuthStyles } from './auth.styles';

export default function AuthScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { session, isLoading: authLoading } = useAuth();
  const { showError } = useToast();
  const { signIn, isLoading: signinLoading } = useEmailSignin();
  const styles = createAuthStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Handle deep links for password reset
  useEffect(() => {
    const handleDeepLink = async (url: string) => {
      if (url.includes('type=recovery')) {
        try {
          // TODO: Replace with business layer password reset handling
          // For now, just navigate to chat on recovery
          router.replace('/chat');
        } catch (e) {
          console.error('Error handling deep link:', e);
          showError(t('auth.password_reset_failed'));
        }
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));

    // Check for initial URL
    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, [showError, t]);

  // Redirect if already authenticated
  useEffect(() => {
    if (session) {
      router.replace('/chat');
    }
  }, [session]);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError(t('auth.email_required'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(t('auth.invalid_email'));
      return false;
    }

    setEmailError(null);
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError(t('auth.password_required'));
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const handleSignIn = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const result = await signIn(email, password);
      if (!result.success) {
        showError(result.error || t('auth.signin_failed'));
      }
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Sign in failed', error);
      showError(t('auth.signin_failed'));
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const handleSignUp = () => {
    router.push('/signup');
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingScreen />
        <Text style={styles.loadingText}>{t('auth.checking_session')}</Text>
      </View>
    );
  }

  return (
    <FormWrapper>
      <Text variant="h1" weight="bold" style={styles.title}>
        {t('auth.welcome')}
      </Text>

      <SocialAuthButtons
        onSuccess={(provider) => {
          console.log(`Successfully authenticated with ${provider}`);
          // Navigation will be handled by auth state change
        }}
        onError={(provider, error) => {
          console.error(`Failed to authenticate with ${provider}: ${error}`);
          showError(`Failed to authenticate with ${provider}: ${error}`);
        }}
        onRequiresAdditionalInfo={(provider, providerData) => {
          console.log(`Additional info required for ${provider}`, providerData);
          // TODO: Navigate to additional info form
        }}
      />

      <View style={styles.divider}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.borders.colors.light }} />
        <Text style={styles.dividerText}>{t('auth.or')}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.borders.colors.light }} />
      </View>

      <Input
        placeholder={t('auth.email')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) validateEmail(text);
        }}
        status={emailError ? 'error' : 'default'}
        errorText={emailError ?? undefined}
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />}
      />

      <Input
        placeholder={t('auth.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) validatePassword(text);
        }}
        status={passwordError ? 'error' : 'default'}
        errorText={passwordError ?? undefined}
        secureTextEntry
        leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} />}
      />

      <Button
        label={signinLoading ? t('auth.signing_in') : t('auth.sign_in')}
        onPress={handleSignIn}
        disabled={signinLoading || !email.trim() || !password.trim()}
        isLoading={signinLoading}
        fullWidth
        containerStyle={styles.button}
      />

      <Button
        variant="ghost"
        label={t('auth.forgot_password')}
        onPress={handleForgotPassword}
        fullWidth
        containerStyle={styles.linkButton}
      />

      <Button
        variant="ghost"
        label={t('auth.need_account')}
        onPress={handleSignUp}
        fullWidth
        containerStyle={styles.linkButton}
      />

      {/* Language selector */}
      <View style={{ marginTop: theme.spacing.xl }}>
        <LanguageSelector />
      </View>
    </FormWrapper>
  );
}
