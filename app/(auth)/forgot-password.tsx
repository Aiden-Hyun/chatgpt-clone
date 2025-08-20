
import { Button, Input, Text } from '@/components/ui';
import { FormWrapper } from '@/components/FormWrapper';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { getButtonSize } from '@/shared/utils/layout';
import { useToast } from '@/features/alert';
import { usePasswordReset } from '@/features/auth/hooks';
import { useLanguageContext } from '@/features/language';
import { useAppTheme } from '@/features/theme/theme';

export default function ForgotPasswordScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { resetPassword, isLoading } = usePasswordReset();
  const { showSuccess, showError } = useToast();

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
      await resetPassword(email.trim());
      showSuccess(t('auth.password_reset_sent'));
      router.replace('/auth');
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
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border.light,
          backgroundColor: theme.colors.background.primary,
        }}>
          <TouchableOpacity 
            onPress={handleGoBack} 
            style={{
              padding: theme.spacing.sm,
              marginRight: theme.spacing.md,
              minWidth: getButtonSize('action'),
              minHeight: getButtonSize('action'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text variant="h3" weight="semibold" style={{ flex: 1, textAlign: 'center', marginRight: getButtonSize('header') }}>
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
              />
              
              <Button
                label={isLoading ? t('common.loading') : t('auth.send_reset_email')}
                onPress={handleResetPassword}
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
  description: {
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
}; 