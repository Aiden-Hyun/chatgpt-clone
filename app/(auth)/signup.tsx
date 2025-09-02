
import { FormWrapper } from '@/components/FormWrapper';
import { Button, Input, Text } from '@/components/ui';
import { useToast } from '@/features/alert';
import { useEmailSignup } from '@/features/auth';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { signUp, isLoading } = useEmailSignup();
  const { showSuccess, showError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!email.trim()) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.email_invalid');
    }

    // Password validation
    if (!password) {
      newErrors.password = t('auth.password_required');
    } else if (password.length < 6) {
      newErrors.password = t('auth.password_too_short');
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.confirm_password_required');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwords_dont_match');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await signUp(email.trim(), password);
      showSuccess(t('auth.account_created'));
      router.replace('/auth');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific error cases
      if (error?.message?.includes('email')) {
        setErrors(prev => ({ ...prev, email: t('auth.email_already_exists') }));
      } else if (error?.message?.includes('password')) {
        setErrors(prev => ({ ...prev, password: t('auth.password_too_weak') }));
      } else {
        showError(t('auth.signup_failed'));
      }
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
    } catch {
      router.replace('/auth');
    }
  };

  const handleEmailSubmit = () => {
    // Focus next input (password)
    // This will be handled by the form
  };

  const handlePasswordSubmit = () => {
    // Focus next input (confirm password)
    // This will be handled by the form
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
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
          borderBottomWidth: 1,
          borderBottomColor: theme.borders.colors.light,
          backgroundColor: theme.colors.background.primary,
        }}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={{
              padding: theme.spacing.sm,
              marginRight: theme.spacing.md,
              // Use consistent button size for all platforms
              minWidth: theme.layout.buttonSizes.action,
              minHeight: theme.layout.buttonSizes.action,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="arrow-back-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h3" weight="semibold" style={{ flex: 1, textAlign: 'center', marginRight: theme.layout.buttonSizes.header }}>
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
                onSubmitEditing={handleSignup}
                status={errors.confirmPassword ? 'error' : 'default'}
                errorText={errors.confirmPassword}
              />
              
              <Button
                label={isLoading ? t('common.loading') : t('auth.sign_up')}
                onPress={handleSignup}
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
              />
            </FormWrapper>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center' as const,
  },
}; 