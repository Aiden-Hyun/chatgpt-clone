import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useEmailSignup } from '../../src/features/auth/hooks';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/shared/components';
import { createSignupStyles } from './signup.styles';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { signUp, isLoading } = useEmailSignup();
  const styles = createSignupStyles();

  // Refs for form handling
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    Keyboard.dismiss();
    
    if (!validateForm()) {
      return;
    }

    console.log('Form validation passed, attempting signup...');

    try {
      const result = await signUp(email, password);
      console.log('Signup result:', result);
      
      if (result.success) {
        console.log('Signup successful, showing success alert');
        
        // Use direct Alert.alert to bypass the error system
        Alert.alert(
          'Account Created Successfully!', 
          'Please check your email and click the confirmation link to activate your account. You can then sign in.',
          [
            { 
              text: 'OK', 
              onPress: () => {
                console.log('Success alert OK pressed, navigating to signin');
                try {
                  router.replace('/signin');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }
            }
          ]
        );
      } else {
        console.error('Signup failed:', result.error);
        // Use direct Alert.alert for error too
        Alert.alert('Signup Failed', result.error || 'Failed to create account. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleEmailSubmit = () => {
    passwordRef.current?.focus();
  };

  const handlePasswordSubmit = () => {
    confirmPasswordRef.current?.focus();
  };

  const handleConfirmPasswordSubmit = () => {
    handleSignup();
  };

  const handleGoToSignin = () => {
    try {
      router.replace('/signin');
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
          <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
          
          <FormWrapper onSubmit={handleSignup} style={{ width: '100%' }}>
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
              onFocus={() => console.log('Email input focused on signup')}
              onBlur={() => console.log('Email input blurred on signup')}
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
              returnKeyType="next"
              onSubmitEditing={handlePasswordSubmit}
              blurOnSubmit={false}
            />
            {errors.password && (
              <ThemedText style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {errors.password}
              </ThemedText>
            )}
            
            <ThemedTextInput
              ref={confirmPasswordRef}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors(prev => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              secureTextEntry
              autoCapitalize="none"
              editable={!isLoading}
              variant="filled"
              returnKeyType="done"
              onSubmitEditing={handleConfirmPasswordSubmit}
            />
            {errors.confirmPassword && (
              <ThemedText style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                {errors.confirmPassword}
              </ThemedText>
            )}
          </FormWrapper>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => {
              console.log('Signup button pressed');
              handleSignup();
            }}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.buttonText}>
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleGoToSignin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>Already have an account? Sign In</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 