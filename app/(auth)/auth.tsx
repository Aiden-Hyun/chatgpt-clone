import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useToast } from '../../src/features/alert';
import { useEmailSignin } from '../../src/features/auth/hooks';
import { LanguageSelector, useLanguageContext } from '../../src/features/language';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/features/ui';
import { useLoadingState } from '../../src/shared/hooks';
import { useErrorStateCombined } from '../../src/shared/hooks/error';
import { supabase } from '../../src/shared/lib/supabase';
import { createAuthStyles } from './auth.styles';

export default function AuthScreen() {
  const [isSigninMode, setIsSigninMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  
  const { signIn, isLoading: isSigningIn } = useEmailSignin();
  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingInWithGoogle, startLoading: startSigningInWithGoogle, stopLoading: stopSigningInWithGoogle } = useLoadingState();
  const { setNetworkError, setAuthError, clearError, currentError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: false,
    logToConsole: true
  });
  const { showSuccess } = useToast();
  
  const pathname = usePathname();
  const styles = createAuthStyles();
  const navigationAttempted = useRef(false);
  const { t } = useLanguageContext();
  
  // Refs for form handling
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Session check logic
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setNetworkError('Failed to check session status', { 
          context: 'session-check',
          originalError: error,
          endpoint: 'auth.getSession'
        });
        stopLoading();
        return;
      }
      
      if (session) {
        showSuccess(t('auth.login_successful') || 'Login successful!');
        router.replace('/');
      } else {
        stopLoading();
      }
    } catch (error) {
      setNetworkError('Failed to check session status - please check your internet connection', {
        context: 'session-check',
        originalError: error,
        endpoint: 'auth.getSession',
        isNetworkError: true
      });
      stopLoading();
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

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
      setAuthError('Failed to start Google login. Please try again.', {
        context: 'google-oauth',
        originalError: error,
        provider: 'google',
        redirectUrl: Constants.linkingUri
      });
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
      console.log('Signin result:', result);
      
      if (result.success) {
        console.log('Signin successful, navigating to home');
        showSuccess(t('auth.login_successful') || 'Login successful!');
        router.replace('/');
      } else {
        console.error('Signin failed:', result.error);
        Alert.alert('Sign In Failed', result.error || 'Failed to sign in. Please check your credentials and try again.');
      }
    } catch (error) {
      console.error('Signin error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
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

  const retrySessionCheck = () => {
    clearError(currentError?.id || '');
    startLoading();
    checkSession().catch(error => {
      console.error('Session check error:', error);
    });
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
          
          {/* Show retry button for network errors */}
          {currentError && currentError.type === 'network' && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={retrySessionCheck}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.retryButtonText}>{t('auth.retry_connection')}</ThemedText>
            </TouchableOpacity>
          )}

          {/* Language Selector */}
          <LanguageSelector />
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 