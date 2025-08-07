import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { usePasswordReset } from '../../src/features/auth/hooks';
import { FormWrapper, ThemedText, ThemedTextInput, ThemedView } from '../../src/features/ui';
import { createForgotPasswordStyles } from './forgot-password.styles';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [hasError, setHasError] = useState(false);
  const { resetPassword, isLoading } = usePasswordReset();
  const styles = createForgotPasswordStyles();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    try {
      if (!email) {
        Alert.alert('Error', 'Please enter your email address');
        return;
      }

      if (!validateEmail(email)) {
        Alert.alert('Error', 'Please enter a valid email address');
        return;
      }

      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert(
          'Success', 
          'Password reset email sent. Please check your email and follow the instructions.',
          [{ text: 'OK', onPress: () => {
            try {
              router.replace('/signin');
            } catch (error) {
              setHasError(true);
            }
          }}]
        );
      }
    } catch (error) {
      setHasError(true);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  };

  const handleGoBack = () => {
    try {
      router.back();
    } catch (error) {
      // Fallback to signin if back navigation fails
      try {
        router.replace('/signin');
      } catch (fallbackError) {
        setHasError(true);
      }
    }
  };

  // Error state
  if (hasError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 20 }}>Something went wrong</Text>
        <TouchableOpacity 
          style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}
          onPress={() => setHasError(false)}
        >
          <Text style={{ color: 'white' }}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Reset Password</ThemedText>
      
      <ThemedText style={styles.description}>
        Enter your email address and we'll send you a link to reset your password.
      </ThemedText>
      
      <FormWrapper onSubmit={handleResetPassword} style={{ width: '100%' }}>
        <ThemedTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLoading}
          variant="filled"
        />
      </FormWrapper>
      
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <ThemedText style={styles.buttonText}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={handleGoBack}
        disabled={isLoading}
      >
        <ThemedText type="link" style={styles.linkText}>Back to Sign In</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
} 