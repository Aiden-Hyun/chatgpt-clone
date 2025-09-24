import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Logger } from '../../../service/shared/utils/Logger';
import { PasswordResetFormComponentProps } from '../../interfaces/auth';
import { PasswordResetRequestValues, ResetFormValues, useAuthForms } from '../hooks/useAuthForms';

export function PasswordResetForm({
  mode = 'request',
  resetToken,
  onBackToLogin,
  onSuccess,
  style
}: PasswordResetFormComponentProps) {
  const [requestValues, setRequestValues] = useState<PasswordResetRequestValues>({
    email: ''
  });

  const [resetValues, setResetValues] = useState<ResetFormValues>({
    token: resetToken || '',
    newPassword: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    passwordResetState,
    resetPasswordState,
    handlePasswordResetRequest,
    handlePasswordResetSubmit,
    validatePasswordResetForm,
    validateResetForm,
    getPasswordStrength,
    clearErrors
  } = useAuthForms();

  // Update token when prop changes
  useEffect(() => {
    if (resetToken) {
      setResetValues(prev => ({ ...prev, token: resetToken }));
    }
  }, [resetToken]);

  /**
   * Handle request form field changes
   */
  const handleRequestFieldChange = useCallback((field: keyof PasswordResetRequestValues, value: string) => {
    setRequestValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error when user interacts
    if (passwordResetState.error) {
      clearErrors();
    }
  }, [fieldErrors, passwordResetState.error, clearErrors]);

  /**
   * Handle reset form field changes
   */
  const handleResetFieldChange = useCallback((field: keyof ResetFormValues, value: string) => {
    setResetValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error when user interacts
    if (resetPasswordState.error) {
      clearErrors();
    }
  }, [fieldErrors, resetPasswordState.error, clearErrors]);

  /**
   * Handle password reset request submission
   */
  const handleRequestSubmit = useCallback(async () => {
    try {
      Logger.info('PasswordResetForm: Request submission started');

      // Validate form
      const errors = validatePasswordResetForm(requestValues);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        Logger.warn('PasswordResetForm: Request validation failed', { errors });
        return;
      }

      // Submit request
      await handlePasswordResetRequest(requestValues.email);

      // Call success callback if request was successful
      if (passwordResetState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('PasswordResetForm: Request submission error', { error });
    }
  }, [requestValues, validatePasswordResetForm, handlePasswordResetRequest, passwordResetState.success, onSuccess]);

  /**
   * Handle password reset completion submission
   */
  const handleResetSubmit = useCallback(async () => {
    try {
      Logger.info('PasswordResetForm: Reset submission started');

      // Validate form
      const errors = validateResetForm(resetValues);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        Logger.warn('PasswordResetForm: Reset validation failed', { errors });
        return;
      }

      // Submit reset
      await handlePasswordResetSubmit(resetValues);

      // Call success callback if reset was successful
      if (resetPasswordState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('PasswordResetForm: Reset submission error', { error });
    }
  }, [resetValues, validateResetForm, handlePasswordResetSubmit, resetPasswordState.success, onSuccess]);

  /**
   * Get password strength info
   */
  const passwordStrength = resetValues.newPassword ? getPasswordStrength(resetValues.newPassword) : null;

  // Render password reset request form
  if (mode === 'request') {
    return (
      <View style={[styles.container, style]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </Text>
        </View>

        {/* Error Alert */}
        {passwordResetState.error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{passwordResetState.error}</Text>
          </View>
        )}

        {/* Success Alert */}
        {passwordResetState.success && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{passwordResetState.success}</Text>
          </View>
        )}

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.email && styles.inputError
            ]}
            value={requestValues.email}
            onChangeText={(text) => handleRequestFieldChange('email', text)}
            placeholder="Enter your email address"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!passwordResetState.isLoading}
          />
          {fieldErrors.email && (
            <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
          )}
        </View>

        {/* Send Reset Button */}
        <Pressable
          style={[
            styles.submitButton,
            passwordResetState.isLoading && styles.submitButtonDisabled
          ]}
          onPress={handleRequestSubmit}
          disabled={passwordResetState.isLoading}
        >
          <Text style={styles.submitButtonText}>
            {passwordResetState.isLoading ? 'Sending...' : 'Send Reset Instructions'}
          </Text>
        </Pressable>

        {/* Back to Login */}
        {onBackToLogin && (
          <View style={styles.backContainer}>
            <Text style={styles.backText}>Remember your password? </Text>
            <Pressable onPress={onBackToLogin}>
              <Text style={styles.backLink}>Back to Sign In</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  // Render password reset completion form
  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Please enter your new password below.
        </Text>
      </View>

      {/* Error Alert */}
      {resetPasswordState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{resetPasswordState.error}</Text>
        </View>
      )}

      {/* Success Alert */}
      {resetPasswordState.success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{resetPasswordState.success}</Text>
        </View>
      )}

      {/* Reset Token Input (if not provided via prop) */}
      {!resetToken && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Reset Token</Text>
          <TextInput
            style={[
              styles.input,
              fieldErrors.token && styles.inputError
            ]}
            value={resetValues.token}
            onChangeText={(text) => handleResetFieldChange('token', text)}
            placeholder="Enter the reset token from your email"
            placeholderTextColor="#999"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!resetPasswordState.isLoading}
          />
          {fieldErrors.token && (
            <Text style={styles.fieldErrorText}>{fieldErrors.token}</Text>
          )}
        </View>
      )}

      {/* New Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.newPassword && styles.inputError
            ]}
            value={resetValues.newPassword}
            onChangeText={(text) => handleResetFieldChange('newPassword', text)}
            placeholder="Enter your new password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!resetPasswordState.isLoading}
          />
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {showPassword ? '🙈' : '👁️'}
            </Text>
          </Pressable>
        </View>
        {fieldErrors.newPassword && (
          <Text style={styles.fieldErrorText}>{fieldErrors.newPassword}</Text>
        )}
        
        {/* Password Strength Indicator */}
        {passwordStrength && resetValues.newPassword && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              <View 
                style={[
                  styles.passwordStrengthFill,
                  { 
                    width: `${passwordStrength.score}%`,
                    backgroundColor: 
                      passwordStrength.level === 'weak' ? '#ff4444' :
                      passwordStrength.level === 'fair' ? '#ffaa00' :
                      passwordStrength.level === 'good' ? '#44aa44' : '#00aa00'
                  }
                ]} 
              />
            </View>
            <Text style={[
              styles.passwordStrengthText,
              { 
                color: 
                  passwordStrength.level === 'weak' ? '#ff4444' :
                  passwordStrength.level === 'fair' ? '#ffaa00' :
                  passwordStrength.level === 'good' ? '#44aa44' : '#00aa00'
              }
            ]}>
              {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)} Password
            </Text>
            {passwordStrength.feedback.length > 0 && (
              <View style={styles.passwordFeedbackContainer}>
                {passwordStrength.feedback.slice(0, 2).map((feedback, index) => (
                  <Text key={index} style={styles.passwordFeedbackText}>
                    • {feedback}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.confirmPassword && styles.inputError
            ]}
            value={resetValues.confirmPassword}
            onChangeText={(text) => handleResetFieldChange('confirmPassword', text)}
            placeholder="Confirm your new password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!resetPasswordState.isLoading}
          />
          <Pressable
            style={styles.passwordToggle}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.passwordToggleText}>
              {showConfirmPassword ? '🙈' : '👁️'}
            </Text>
          </Pressable>
        </View>
        {fieldErrors.confirmPassword && (
          <Text style={styles.fieldErrorText}>{fieldErrors.confirmPassword}</Text>
        )}
      </View>

      {/* Reset Password Button */}
      <Pressable
        style={[
          styles.submitButton,
          resetPasswordState.isLoading && styles.submitButtonDisabled
        ]}
        onPress={handleResetSubmit}
        disabled={resetPasswordState.isLoading}
      >
        <Text style={styles.submitButtonText}>
          {resetPasswordState.isLoading ? 'Resetting...' : 'Reset Password'}
        </Text>
      </Pressable>

      {/* Back to Login */}
      {onBackToLogin && (
        <View style={styles.backContainer}>
          <Text style={styles.backText}>Remember your password? </Text>
          <Pressable onPress={onBackToLogin}>
            <Text style={styles.backLink}>Back to Sign In</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 32,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22
  },
  errorContainer: {
    backgroundColor: '#fee',
    borderColor: '#fcc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  errorText: {
    color: '#c33',
    fontSize: 14,
    textAlign: 'center'
  },
  successContainer: {
    backgroundColor: '#efe',
    borderColor: '#cfc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  successText: {
    color: '#3c3',
    fontSize: 14,
    textAlign: 'center'
  },
  inputContainer: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  inputError: {
    borderColor: '#f44'
  },
  fieldErrorText: {
    color: '#f44',
    fontSize: 12,
    marginTop: 4
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    padding: 4
  },
  passwordToggleText: {
    fontSize: 18
  },
  passwordStrengthContainer: {
    marginTop: 8
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginBottom: 4
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4
  },
  passwordFeedbackContainer: {
    marginTop: 4
  },
  passwordFeedbackText: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc'
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backText: {
    fontSize: 14,
    color: '#666'
  },
  backLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500'
  }
});
