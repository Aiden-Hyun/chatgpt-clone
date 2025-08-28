import { Button, Card, FormWrapper, Input, LoadingScreen, Text } from '../../../components';
import { useToast } from '../../../alert/toast/ToastContext';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useEmailSignin } from '../../../auth/hooks/useEmailSignin';
import { LanguageSelector, useLanguageContext } from '../../../language';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { useLoadingState } from '../../../shared/hooks/useLoadingState';
import React, { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import { router } from 'expo-router';
import { createAuthStyles } from './auth.styles';
import { supabase } from '../../../service/shared/lib/supabase';

export default function AuthScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { session, isLoading: authLoading } = useAuth();
  const { showError } = useToast();
  const { signin, isLoading: signinLoading } = useEmailSignin();
  const { isLoading, startLoading, stopLoading } = useLoadingState();
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
          const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
          if (error) {
            showError(t('auth.password_reset_failed'));
          } else {
            router.replace('/chat');
          }
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
      startLoading();
      await signin(email, password);
      // Navigation will be handled by auth state change
    } catch (error) {
      showError(t('auth.signin_failed'));
    } finally {
      stopLoading();
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

      <Card variant="elevated" padding="lg" containerStyle={styles.googleButton}>
        <Text variant="button" style={styles.googleButtonText}>
          {t('auth.continue_with_google')}
        </Text>
      </Card>

      <View style={styles.divider}>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.borders.light }} />
        <Text style={styles.dividerText}>{t('auth.or')}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.colors.borders.light }} />
      </View>

      <Input
        placeholder={t('auth.email')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) validateEmail(text);
        }}
        error={emailError}
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon="mail-outline"
      />

      <Input
        placeholder={t('auth.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) validatePassword(text);
        }}
        error={passwordError}
        secureTextEntry
        leftIcon="lock-closed-outline"
      />

      <Button
        label={isLoading || signinLoading ? t('auth.signing_in') : t('auth.sign_in')}
        onPress={handleSignIn}
        disabled={isLoading || signinLoading || !email.trim() || !password.trim()}
        isLoading={isLoading || signinLoading}
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