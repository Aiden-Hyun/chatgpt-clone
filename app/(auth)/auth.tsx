import { Button, Card, FormWrapper, Input, LoadingScreen, Text } from '@/components';
import { useToast } from '@/features/alert';
import { useAuth } from '@/features/auth';
import { useEmailSignin } from '@/features/auth/hooks';
import { LanguageSelector, useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { useLoadingState } from '@/shared/hooks';
import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View
} from 'react-native';

import { supabase } from '@/shared/lib/supabase';
import { createAuthStyles } from './auth.styles';

export default function AuthScreen() {
  console.log('[AuthScreen] 🎯 About to call useAuth()');
  const { session } = useAuth();
  console.log('[AuthScreen] ✅ useAuth() called successfully');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, isLoading: isSigningIn } = useEmailSignin();
  const { loading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingInWithGoogle, startLoading: startSigningInWithGoogle, stopLoading: stopSigningInWithGoogle } = useLoadingState();

  const { showSuccess, showError } = useToast();
  
  const pathname = usePathname();
  const theme = useAppTheme();
  const styles = createAuthStyles(theme);
  const navigationAttempted = useRef(false);
  const { t } = useLanguageContext();
  
  // Note: We're no longer using refs with our new Input component

  // Session check logic
  const checkSession = useCallback(async () => {
    try {
      if (session) {
        showSuccess(t('auth.login_successful') || 'Login successful!');
        router.replace('/');
      } else {
        stopLoading();
      }
    } catch (error) {
      console.error(error);
      showError(t('auth.network_error'));
      stopLoading();
    }
  }, [session, showSuccess, showError, t, stopLoading]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Monitor pathname changes to detect navigation
  useEffect(() => {
    if (navigationAttempted.current) {
      console.log('Pathname changed to:', pathname);
      navigationAttempted.current = false;
    }
  }, [pathname]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleLogin = async () => {
    try {
      startSigningInWithGoogle();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${Constants.linkingUri}`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
    } catch {
      showError(t('auth.google_login_failed'));
      stopSigningInWithGoogle();
    }
  };

  const handleEmailSignin = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    console.log('Form validation passed, attempting signin...');

    try {
      const result = await signIn(email, password);
      console.log('🔍 [AUTH] Signin result:', result);
      
      if (result.success) {
        console.log('✅ [AUTH] Signin successful, navigating to home');
        showSuccess(t('auth.login_successful') || 'Login successful!');
        router.replace('/');
      } else {
        console.log('❌ [AUTH] Signin failed, showing error:', result.error);
        console.log('❌ [AUTH] Network error detected:', result.isNetworkError);
        
        // Show appropriate localized message based on error type
        if (result.isNetworkError) {
          showError(t('auth.network_error'));
        } else {
          showError(t('auth.check_credentials'));
        }
      }
    } catch (error) {
      // Check if this is a network error in the UI catch block
      const isNetworkError = !navigator.onLine ||
                            (error instanceof Error && 
                             (error.message.toLowerCase().includes('network') ||
                              error.message.toLowerCase().includes('fetch') ||
                              error.message.toLowerCase().includes('connection')));
      
      if (isNetworkError) {
        showError(t('auth.network_error'));
      } else {
        showError(t('auth.unexpected_error'));
      }
    }
  };

  const handleEmailSubmit = () => {
    // We're no longer using refs to focus
    // Focus is handled automatically by the Input component
  };

  const handlePasswordSubmit = () => {
    handleEmailSignin();
  };

  const handleForgotPassword = () => {
    try {
      router.push('/forgot-password');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleGoToSignup = () => {
    try {
      router.push('/signup');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  if (loading) {
    return <LoadingScreen message={t('common.loading')} />;
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Card variant="flat" padding="lg" containerStyle={{ width: '100%', maxWidth: 400 }}>
            <Text variant="h1" center>{t('auth.welcome')}</Text>
            
            {/* Google Login Button */}
            <Button
              variant="primary"
              size="lg"
              label={signingInWithGoogle ? t('auth.redirecting') : `🔍 ${t('auth.login_with_google')}`}
              onPress={handleGoogleLogin}
              disabled={signingInWithGoogle}
              isLoading={signingInWithGoogle}
              fullWidth
              containerStyle={{ marginTop: theme.spacing.lg }}
            />
            
            {/* Divider */}
            <View style={styles.divider}>
              <Text variant="caption" color={theme.colors.text.tertiary}>{t('auth.or')}</Text>
            </View>
            
            {/* Email/Password Form */}
            <FormWrapper onSubmit={handleEmailSignin} style={{ width: '100%' }}>
              <Input
                label={t('auth.email')}
                placeholder={t('auth.email')}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email) {
                    setErrors(prev => ({ ...prev, email: undefined }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSigningIn}
                variant="filled"
                returnKeyType="next"
                onSubmitEditing={handleEmailSubmit}
                blurOnSubmit={false}
                errorText={errors.email}
                status={errors.email ? 'error' : 'default'}
              />
              
              <Input
                label={t('auth.password')}
                placeholder={t('auth.password')}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({ ...prev, password: undefined }));
                  }
                }}
                secureTextEntry
                autoCapitalize="none"
                editable={!isSigningIn}
                variant="filled"
                returnKeyType="done"
                onSubmitEditing={handlePasswordSubmit}
                errorText={errors.password}
                status={errors.password ? 'error' : 'default'}
              />
            </FormWrapper>
            
            {/* Sign In Button */}
            <Button
              variant="primary"
              size="lg"
              label={isSigningIn ? t('auth.signing_in') : t('auth.sign_in_with_email')}
              onPress={handleEmailSignin}
              disabled={isSigningIn}
              isLoading={isSigningIn}
              fullWidth
              containerStyle={{ marginTop: theme.spacing.md }}
            />
            
            {/* Links */}
            <Button
              variant="link"
              size="md"
              label={t('auth.forgot_password')}
              onPress={handleForgotPassword}
              disabled={isSigningIn}
              containerStyle={{ marginTop: theme.spacing.sm }}
            />
            
            <Button
              variant="link"
              size="md"
              label={t('auth.no_account_link')}
              onPress={handleGoToSignup}
              disabled={isSigningIn}
              containerStyle={{ marginTop: theme.spacing.sm }}
            />
            
            {/* Language Selector */}
            <View style={{ marginTop: theme.spacing.xl, alignItems: 'center' }}>
              <LanguageSelector />
            </View>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
