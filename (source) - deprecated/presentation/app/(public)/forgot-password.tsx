/**
 * Forgot Password Page - Uses New Presentation Auth System
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

import { createForgotPasswordStyles } from './forgot-password.styles';

export default function ForgotPasswordScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { resetPassword, isLoading } = useBusinessAuth();
  const { showSuccess, showError } = useToast();
  const styles = createForgotPasswordStyles(theme);

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = t('auth.email_required');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = t('auth.email_invalid');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await resetPassword(email.trim());
      
      if (result.success) {
        showSuccess(t('auth.password_reset_sent'));
        router.replace('/auth');
      } else {
        showError(result.error || t('auth.reset_password_failed'));
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      showError(t('auth.reset_password_failed'));
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
            {t('auth.reset_password')}
          </Text>
        </View>

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <FormWrapper onSubmit={handleResetPassword} style={{ width: '100%' }}>
              <Text variant="body" style={styles.description}>
                {t('auth.forgot_password_description')}
              </Text>
              
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
                returnKeyType="done"
                onSubmitEditing={handleResetPassword}
                status={errors.email ? 'error' : 'default'}
                errorText={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color={theme.colors.text.secondary} />}
              />
              
              <Button
                label={isLoading ? t('common.loading') : t('auth.send_reset_email')}
                onPress={handleResetPassword}
                disabled={isLoading}
                isLoading={isLoading}
                fullWidth
                containerStyle={styles.button}
              />

              <Button
                variant="ghost"
                label={t('auth.back_to_login')}
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
