import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthProvider } from '../../../business/auth/use-cases/SocialAuthUseCase';
import { Logger } from '../../../service/shared/utils/Logger';
import { LoginFormComponentProps } from '../../interfaces/auth';
import { LoginFormValues, useAuthForms } from '../hooks/useAuthForms';

export function LoginForm({
  onForgotPassword,
  onSignUpPress,
  onSuccess,
  showSocialAuth = true,
  enabledProviders = ['google', 'apple', 'github'],
  style
}: LoginFormComponentProps) {
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
    rememberMe: false
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);

  const {
    loginState,
    handleLoginSubmit,
    handleSocialAuth,
    validateLoginForm,
    clearErrors
  } = useAuthForms();

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback((field: keyof LoginFormValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error when user interacts
    if (loginState.error) {
      clearErrors();
    }
  }, [fieldErrors, loginState.error, clearErrors]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    try {
      Logger.info('LoginForm: Form submission started');

      // Validate form
      const errors = validateLoginForm(formValues);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        Logger.warn('LoginForm: Form validation failed', { errors });
        return;
      }

      // Submit form
      await handleLoginSubmit(formValues);

      // Call success callback if login was successful
      if (loginState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('LoginForm: Form submission error', { error });
    }
  }, [formValues, validateLoginForm, handleLoginSubmit, loginState.success, onSuccess]);

  /**
   * Handle social authentication
   */
  const handleSocialLogin = useCallback(async (provider: AuthProvider) => {
    try {
      Logger.info('LoginForm: Social login started', { provider });
      await handleSocialAuth(provider);
      
      if (loginState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('LoginForm: Social login error', { error, provider });
    }
  }, [handleSocialAuth, loginState.success, onSuccess]);

  /**
   * Get provider display info
   */
  const getProviderInfo = (provider: AuthProvider) => {
    const providerInfo = {
      google: { name: 'Google', color: '#4285F4', icon: '🔍' },
      apple: { name: 'Apple', color: '#000000', icon: '🍎' },
      github: { name: 'GitHub', color: '#333333', icon: '🐙' },
      facebook: { name: 'Facebook', color: '#1877F2', icon: '📘' }
    };
    return providerInfo[provider] || { name: provider, color: '#666666', icon: '🔐' };
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Welcome back! Please sign in to continue.</Text>
      </View>

      {/* Error Alert */}
      {loginState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{loginState.error}</Text>
        </View>
      )}

      {/* Success Alert */}
      {loginState.success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{loginState.success}</Text>
        </View>
      )}

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.email && styles.inputError
          ]}
          value={formValues.email}
          onChangeText={(text) => handleFieldChange('email', text)}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loginState.isLoading}
        />
        {fieldErrors.email && (
          <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>
        )}
      </View>

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.password && styles.inputError
            ]}
            value={formValues.password}
            onChangeText={(text) => handleFieldChange('password', text)}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loginState.isLoading}
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
        {fieldErrors.password && (
          <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>
        )}
      </View>

      {/* Remember Me & Forgot Password */}
      <View style={styles.optionsContainer}>
        <Pressable
          style={styles.rememberMeContainer}
          onPress={() => handleFieldChange('rememberMe', !formValues.rememberMe)}
        >
          <View style={[
            styles.checkbox,
            formValues.rememberMe && styles.checkboxChecked
          ]}>
            {formValues.rememberMe && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.rememberMeText}>Remember me</Text>
        </Pressable>

        {onForgotPassword && (
          <Pressable onPress={onForgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </Pressable>
        )}
      </View>

      {/* Sign In Button */}
      <Pressable
        style={[
          styles.signInButton,
          loginState.isLoading && styles.signInButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={loginState.isLoading}
      >
        <Text style={styles.signInButtonText}>
          {loginState.isLoading ? 'Signing In...' : 'Sign In'}
        </Text>
      </Pressable>

      {/* Social Authentication */}
      {showSocialAuth && enabledProviders.length > 0 && (
        <>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            {enabledProviders.map((provider) => {
              const providerInfo = getProviderInfo(provider);
              return (
                <Pressable
                  key={provider}
                  style={[
                    styles.socialButton,
                    { borderColor: providerInfo.color }
                  ]}
                  onPress={() => handleSocialLogin(provider)}
                  disabled={loginState.isLoading}
                >
                  <Text style={styles.socialButtonIcon}>{providerInfo.icon}</Text>
                  <Text style={[
                    styles.socialButtonText,
                    { color: providerInfo.color }
                  ]}>
                    {providerInfo.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      {/* Sign Up Link */}
      {onSignUpPress && (
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don&apos;t have an account? </Text>
          <Pressable onPress={onSignUpPress}>
            <Text style={styles.signUpLink}>Sign Up</Text>
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
    textAlign: 'center'
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
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666'
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500'
  },
  signInButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24
  },
  signInButtonDisabled: {
    backgroundColor: '#ccc'
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd'
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666'
  },
  socialButtonsContainer: {
    gap: 12,
    marginBottom: 24
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff'
  },
  socialButtonIcon: {
    fontSize: 20,
    marginRight: 8
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '500'
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  signUpText: {
    fontSize: 14,
    color: '#666'
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500'
  }
});
