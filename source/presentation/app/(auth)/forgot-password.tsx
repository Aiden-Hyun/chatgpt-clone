import { router } from 'expo-router';
import React, { useState } from 'react';
import { useToast } from '../../../alert/toast/ToastContext';
import { usePasswordReset } from '../../../auth/hooks/usePasswordReset';
import { FormWrapper } from '../../../components/FormWrapper';
import { Button, Input, Text } from '../../../components/ui';
import { useLanguageContext } from '../../../language/LanguageContext';
import { useAppTheme } from '../../../theme/hooks/useTheme';
import { createForgotPasswordStyles } from './forgot-password.styles';

export default function ForgotPasswordScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { showSuccess, showError } = useToast();
  const { sendResetEmail, isLoading } = usePasswordReset();
  const styles = createForgotPasswordStyles(theme);

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      setEmailError(t('auth.email_required'));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError(t('auth.invalid_email'));
      return false;
    }

    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) {
      return;
    }

    try {
      await sendResetEmail(email);
      showSuccess(t('auth.reset_email_sent'));
      
      // Navigate back to sign in after a short delay
      setTimeout(() => {
        router.replace('/auth');
      }, 2000);
    } catch (error) {
      showError(t('auth.reset_email_failed'));
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth');
  };

  return (
    <FormWrapper>
      <Text variant="h1" weight="bold" style={styles.title}>
        {t('auth.forgot_password')}
      </Text>
      
      <Text variant="body" style={styles.description}>
        {t('auth.reset_instructions')}
      </Text>
      
      <Input
        placeholder={t('auth.email')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          if (emailError) validateEmail(text);
        }}
        error={emailError}
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon="mail-outline"
      />
      
      <Button
        label={isLoading ? t('auth.sending') : t('auth.send_reset_link')}
        onPress={handleSubmit}
        disabled={isLoading || !email.trim()}
        isLoading={isLoading}
        fullWidth
        containerStyle={styles.button}
      />
      
      <Button
        variant="ghost"
        label={t('auth.back_to_signin')}
        onPress={handleBackToSignIn}
        fullWidth
        containerStyle={styles.linkButton}
      />
    </FormWrapper>
  );
}