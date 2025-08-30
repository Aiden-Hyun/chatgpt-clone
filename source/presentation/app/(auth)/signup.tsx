import { router } from 'expo-router';
import React, { useState } from 'react';

import { useToast } from '../../alert/toast';
import { useEmailSignup } from '../../auth/hooks/useEmailSignup';
import { FormWrapper } from '../../components/FormWrapper';
import { Button, Input, Text } from '../../components/ui';
import { useLanguageContext } from '../../language/LanguageContext';
import { useAppTheme } from '../../theme/hooks/useTheme';

import { createSignupStyles } from './signup.styles';

export default function SignupScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();
  const { showError } = useToast();
  const { signup, isLoading } = useEmailSignup();
  const styles = createSignupStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

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

  const validatePassword = (value: string) => {
    if (!value.trim()) {
      setPasswordError(t('auth.password_required'));
      return false;
    }

    if (value.length < 6) {
      setPasswordError(t('auth.password_too_short'));
      return false;
    }

    setPasswordError(null);
    return true;
  };

  const validateConfirmPassword = (value: string) => {
    if (!value.trim()) {
      setConfirmPasswordError(t('auth.confirm_password_required'));
      return false;
    }

    if (value !== password) {
      setConfirmPasswordError(t('auth.passwords_dont_match'));
      return false;
    }

    setConfirmPasswordError(null);
    return true;
  };

  const handleSubmit = async () => {
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    try {
      await signup(email, password);
      // Navigation will be handled by auth state change
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showError(`${t('auth.signup_failed')}: ${errorMessage}`);
    }
  };

  const handleBackToSignIn = () => {
    router.replace('/auth');
  };

  return (
    <FormWrapper>
      <Text variant="h1" weight="bold" style={styles.title}>
        {t('auth.create_account')}
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
      
      <Input
        placeholder={t('auth.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          if (passwordError) validatePassword(text);
          if (confirmPassword && confirmPasswordError) validateConfirmPassword(confirmPassword);
        }}
        error={passwordError}
        secureTextEntry
        leftIcon="lock-closed-outline"
      />
      
      <Input
        placeholder={t('auth.confirm_password')}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          if (confirmPasswordError) validateConfirmPassword(text);
        }}
        error={confirmPasswordError}
        secureTextEntry
        leftIcon="lock-closed-outline"
      />
      
      <Button
        label={isLoading ? t('auth.creating_account') : t('auth.create_account')}
        onPress={handleSubmit}
        disabled={isLoading || !email.trim() || !password.trim() || !confirmPassword.trim()}
        isLoading={isLoading}
        fullWidth
        containerStyle={styles.button}
      />
      
      <Button
        variant="ghost"
        label={t('auth.already_have_account')}
        onPress={handleBackToSignIn}
        fullWidth
        containerStyle={styles.linkButton}
      />
    </FormWrapper>
  );
}