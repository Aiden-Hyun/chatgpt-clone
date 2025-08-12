
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useToast } from '../../src/features/alert';
import { useEmailSignup } from '../../src/features/auth/hooks';
import { useLanguageContext } from '../../src/features/language';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/features/ui';
import { router } from 'expo-router';
import { createSignupStyles } from './signup.styles';

export default function SignupScreen() {
  const { t } = useLanguageContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const { signUp, isLoading } = useEmailSignup();
  const { showError } = useToast();

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
      newErrors.email = t('auth.enter_email');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.enter_valid_email');
    }

    if (!password.trim()) {
      newErrors.password = t('auth.enter_password');
    } else if (!validatePassword(password)) {
      newErrors.password = t('auth.password_too_short');
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.confirm_password');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwords_must_match');
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
          t('auth.account_created'), 
          t('auth.confirm_email_instructions'),
          [
            { 
              text: 'OK', 
              onPress: async () => {
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
        // Always use localized message instead of server's English error
        showError(t('auth.check_credentials'));
      }
    } catch (error) {
      showError(t('auth.unexpected_error'));
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
          <ThemedText type="title" style={styles.title}>{t('auth.create_account')}</ThemedText>
          
          <FormWrapper onSubmit={handleSignup} style={{ width: '100%' }}>
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
              placeholder={t('auth.confirm_password')}
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
              {isLoading ? t('auth.signing_up') : t('auth.sign_up')}
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={handleGoToSignin}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedText type="link" style={styles.linkText}>{t('auth.have_account_link')}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 