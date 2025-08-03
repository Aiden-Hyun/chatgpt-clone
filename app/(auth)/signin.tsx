
import { router, usePathname } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useEmailSignin } from '../../src/features/auth/hooks';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/shared/components';
import { createSigninStyles } from './signin.styles';

export default function SigninScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const { signIn, isLoading } = useEmailSignin();
  const pathname = usePathname();
  const styles = createSigninStyles();
  
  // Refs for form handling
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  // Debug logging
  useEffect(() => {
    console.log('SigninScreen rendered, pathname:', pathname);
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

  const handleSignin = async () => {
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
        // Navigation will be handled by the auth context
        router.replace('/');
      } else {
        console.error('Signin failed:', result.error);
        // Use direct Alert.alert for better error display
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
    handleSignin();
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
          <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
          
          <FormWrapper onSubmit={handleSignin} style={{ width: '100%' }}>
            <ThemedTextInput
              ref={emailRef}
              placeholder="Email"
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
              editable={!isLoading}
              variant="filled"
              returnKeyType="next"
              onSubmitEditing={handleEmailSubmit}
              blurOnSubmit={false}
              onFocus={() => console.log('Email input focused')}
              onBlur={() => console.log('Email input blurred')}
            />
            {errors.email && (
              <ThemedText style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {errors.email}
              </ThemedText>
            )}
            
            <ThemedTextInput
              ref={passwordRef}
              placeholder="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors(prev => ({ ...prev, password: undefined }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              variant="filled"
              returnKeyType="done"
              onSubmitEditing={handlePasswordSubmit}
              onFocus={() => console.log('Password input focused')}
              onBlur={() => console.log('Password input blurred')}
            />
            {errors.password && (
              <ThemedText style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {errors.password}
              </ThemedText>
            )}
          </FormWrapper>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSignin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleForgotPassword}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>Forgot Password?</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleGoToSignup}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>Don&apos;t have an account? Sign Up</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}