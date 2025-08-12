import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useToast } from '../../src/features/alert';
import { useAuth } from '../../src/features/auth';
import { useEmailSignin } from '../../src/features/auth/hooks';
import { LanguageSelector, useLanguageContext } from '../../src/features/language';
import { useAppTheme } from '../../src/features/theme/lib/theme';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/features/ui';
import { useLoadingState } from '../../src/shared/hooks';

import { supabase } from '../../src/shared/lib/supabase';
import { createAuthStyles } from './auth.styles';

export default function AuthScreen() {
  const { session } = useAuth();
  const [isSigninMode, setIsSigninMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, isLoading: isSigningIn } = useEmailSignin();
  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingInWithGoogle, startLoading: startSigningInWithGoogle, stopLoading: stopSigningInWithGoogle } = useLoadingState();

  const { showSuccess, showError } = useToast();
  
  const pathname = usePathname();
  const theme = useAppTheme();
  const styles = createAuthStyles(theme);
  const navigationAttempted = useRef(false);
  const { t } = useLanguageContext();
  
  // Refs for form handling
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

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
    } catch (error) {
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
    passwordRef.current?.focus();
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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
        <ThemedText style={styles.loadingText}>{t('common.loading')}...</ThemedText>
      </View>
    );
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
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>{t('auth.welcome')}</ThemedText>
          
          {/* Google Login Button */}
          <TouchableOpacity 
            style={[styles.googleButton, signingInWithGoogle && styles.buttonDisabled]}
            onPress={handleGoogleLogin}
            disabled={signingInWithGoogle}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.googleButtonText}>
              {signingInWithGoogle ? t('auth.redirecting') : `🔍 ${t('auth.login_with_google')}`}
            </ThemedText>
          </TouchableOpacity>
          
          {/* Divider */}
          <View style={styles.divider}>
            <ThemedText style={styles.dividerText}>{t('auth.or')}</ThemedText>
          </View>
          
          {/* Email/Password Form */}
          <FormWrapper onSubmit={handleEmailSignin} style={{ width: '100%' }}>
            <ThemedTextInput
              ref={emailRef}
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
            />
            {errors.email && (
              <ThemedText style={styles.errorText}>
                {errors.email}
              </ThemedText>
            )}
            
            <ThemedTextInput
              ref={passwordRef}
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
            />
            {errors.password && (
              <ThemedText style={styles.errorText}>
                {errors.password}
              </ThemedText>
            )}
          </FormWrapper>
          
          {/* Sign In Button */}
          <TouchableOpacity 
            style={[styles.button, isSigningIn && styles.buttonDisabled]}
            onPress={handleEmailSignin}
            disabled={isSigningIn}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.buttonText}>
              {isSigningIn ? t('auth.signing_in') : t('auth.sign_in_with_email')}
            </ThemedText>
          </TouchableOpacity>
          
          {/* Links */}
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleForgotPassword}
            disabled={isSigningIn}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>{t('auth.forgot_password')}</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleGoToSignup}
            disabled={isSigningIn}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>{t('auth.no_account_link')}</ThemedText>
          </TouchableOpacity>
          


          {/* Language Selector */}
          <LanguageSelector />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 