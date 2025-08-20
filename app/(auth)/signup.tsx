
import { Button, FormWrapper, Input, Text } from '@/components';
import { useToast } from '@/features/alert';
import { useEmailSignup } from '@/features/auth';
import { LanguageSelector, useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';
import { getButtonSize, getHeaderHeight } from '@/shared/utils/layout';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import createSignupStyles from './signup.styles';

export default function SignupScreen() {
  const { t } = useLanguageContext();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});

  const { signUp, isLoading } = useEmailSignup();
  const { showError } = useToast();

  const theme = useAppTheme();
  const styles = createSignupStyles(theme);

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

  const handleGoBack = () => {
    try {
      const canGoBack = (router as any).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      router.replace('/auth');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
          {t('auth.create_account')}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <FormWrapper onSubmit={handleSignup} style={{ width: '100%' }}>
            <Input
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
              status={errors.email ? 'error' : 'default'}
              errorText={errors.email}
            />
            
            <Input
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
              status={errors.password ? 'error' : 'default'}
              errorText={errors.password}
            />
            
            <Input
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
              blurOnSubmit={false}
              status={errors.confirmPassword ? 'error' : 'default'}
              errorText={errors.confirmPassword}
            />
            
            <Button
              variant="primary"
              size="lg"
              label={isLoading ? t('auth.creating_account') : t('auth.create_account')}
              onPress={handleSignup}
              disabled={isLoading}
              isLoading={isLoading}
              fullWidth
              containerStyle={{ marginTop: theme.spacing.lg }}
            />
          </FormWrapper>
          
          {/* Links */}
          <Button
            variant="link"
            size="md"
            label={t('auth.already_have_account')}
            onPress={handleGoToSignin}
            disabled={isLoading}
            containerStyle={{ marginTop: theme.spacing.sm }}
          />
          
          {/* Language Selector */}
          <View style={{ marginTop: theme.spacing.xl, alignItems: 'center' }}>
            <LanguageSelector />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
} 