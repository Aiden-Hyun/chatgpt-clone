/**
 * Signup Page - Uses New Presentation Auth System
 * Located under /(public) route group
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';

import { useToast } from '../../alert/toast';
import { useBusinessAuth } from '../../auth/hooks/useBusinessAuth';
import { FormWrapper } from '../../components';
import { Button, Input, Text } from '../../components/ui';
import { useLanguageContext } from '../../language';
import { useAppTheme } from '../../theme/hooks/useTheme';

import { createSignupStyles } from './signup.styles';

export default function SignupScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { signUp, isLoading } = useBusinessAuth();
  const { showSuccess, showError } = useToast();
  const styles = createSignupStyles(theme);

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
      const result = await signUp(email.trim(), password);
      
      if (result.success) {
        showSuccess(t('auth.account_created'));
        router.replace('/auth');
      } else {
        // Handle specific error cases
        if (result.error?.includes('email')) {
          setErrors(prev => ({ ...prev, email: t('auth.email_already_exists') }));
        } else if (result.error?.includes('password')) {
          setErrors(prev => ({ ...prev, password: t('auth.password_too_weak') }));
        } else {
          showError(result.error || t('auth.signup_failed'));
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      showError(t('auth.signup_failed'));
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background.primary }}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h3" weight="semibold" style={styles.headerTitle}>
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
                blurOnSubmit={false}
                status={errors.email ? 'error' : 'default'}
                errorText={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />}
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
                blurOnSubmit={false}
                status={errors.password ? 'error' : 'default'}
                errorText={errors.password}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} />}
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
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.text.secondary} />}
              />
              
              <Button
                label={isLoading ? t('common.loading') : t('auth.sign_up')}
                onPress={handleSignup}
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
                containerStyle={styles.button}
              />

              <Button
                variant="ghost"
                label={t('auth.already_have_account')}
                onPress={() => router.replace('/auth')}
                fullWidth
                containerStyle={styles.linkButton}
              />
            </FormWrapper>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
