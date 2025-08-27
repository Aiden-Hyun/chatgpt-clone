import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthProvider } from '../../../business/auth/use-cases/SocialAuthUseCase';
import { Logger } from '../../../service/shared/utils/Logger';
import { SignUpFormValues, useAuthForms } from '../hooks/useAuthForms';

export interface SignUpFormProps {
  onSignInPress?: () => void;
  onSuccess?: () => void;
  showSocialAuth?: boolean;
  enabledProviders?: AuthProvider[];
  termsUrl?: string;
  privacyUrl?: string;
  style?: any;
}

export function SignUpForm({
  onSignInPress,
  onSuccess,
  showSocialAuth = true,
  enabledProviders = ['google', 'apple', 'github'],
  termsUrl,
  privacyUrl,
  style
}: SignUpFormProps) {
  const [formValues, setFormValues] = useState<SignUpFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    acceptTerms: false
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    signUpState,
    handleSignUpSubmit,
    handleSocialAuth,
    validateSignUpForm,
    getPasswordStrength,
    clearErrors
  } = useAuthForms();

  /**
   * Handle form field changes
   */
  const handleFieldChange = useCallback((field: keyof SignUpFormValues, value: string | boolean) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Clear global error when user interacts
    if (signUpState.error) {
      clearErrors();
    }
  }, [fieldErrors, signUpState.error, clearErrors]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async () => {
    try {
      Logger.info('SignUpForm: Form submission started');

      // Validate form
      const errors = validateSignUpForm(formValues);
      setFieldErrors(errors);

      if (Object.keys(errors).length > 0) {
        Logger.warn('SignUpForm: Form validation failed', { errors });
        return;
      }

      // Submit form
      await handleSignUpSubmit(formValues);

      // Call success callback if sign up was successful
      if (signUpState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('SignUpForm: Form submission error', { error });
    }
  }, [formValues, validateSignUpForm, handleSignUpSubmit, signUpState.success, onSuccess]);

  /**
   * Handle social authentication
   */
  const handleSocialSignUp = useCallback(async (provider: AuthProvider) => {
    try {
      Logger.info('SignUpForm: Social sign up started', { provider });
      await handleSocialAuth(provider);
      
      if (signUpState.success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      Logger.error('SignUpForm: Social sign up error', { error, provider });
    }
  }, [handleSocialAuth, signUpState.success, onSuccess]);

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

  /**
   * Get password strength info
   */
  const passwordStrength = formValues.password ? getPasswordStrength(formValues.password) : null;

  return (
    <ScrollView style={[styles.container, style]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join us today! Please fill in the details below.</Text>
      </View>

      {/* Error Alert */}
      {signUpState.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{signUpState.error}</Text>
        </View>
      )}

      {/* Success Alert */}
      {signUpState.success && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{signUpState.success}</Text>
        </View>
      )}

      {/* Display Name Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={[
            styles.input,
            fieldErrors.displayName && styles.inputError
          ]}
          value={formValues.displayName}
          onChangeText={(text) => handleFieldChange('displayName', text)}
          placeholder="Enter your display name"
          placeholderTextColor="#999"
          autoCapitalize="words"
          autoCorrect={false}
          editable={!signUpState.isLoading}
        />
        {fieldErrors.displayName && (
          <Text style={styles.fieldErrorText}>{fieldErrors.displayName}</Text>
        )}
      </View>

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
          editable={!signUpState.isLoading}
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
            placeholder="Create a password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!signUpState.isLoading}
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
        
        {/* Password Strength Indicator */}
        {passwordStrength && formValues.password && (
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
          </View>
        )}
      </View>

      {/* Confirm Password Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={[
              styles.passwordInput,
              fieldErrors.confirmPassword && styles.inputError
            ]}
            value={formValues.confirmPassword}
            onChangeText={(text) => handleFieldChange('confirmPassword', text)}
            placeholder="Confirm your password"
            placeholderTextColor="#999"
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!signUpState.isLoading}
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

      {/* Terms and Conditions */}
      <View style={styles.termsContainer}>
        <Pressable
          style={styles.checkboxContainer}
          onPress={() => handleFieldChange('acceptTerms', !formValues.acceptTerms)}
        >
          <View style={[
            styles.checkbox,
            formValues.acceptTerms && styles.checkboxChecked
          ]}>
            {formValues.acceptTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <View style={styles.termsTextContainer}>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </Pressable>
        {fieldErrors.acceptTerms && (
          <Text style={styles.fieldErrorText}>{fieldErrors.acceptTerms}</Text>
        )}
      </View>

      {/* Sign Up Button */}
      <Pressable
        style={[
          styles.signUpButton,
          signUpState.isLoading && styles.signUpButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={signUpState.isLoading}
      >
        <Text style={styles.signUpButtonText}>
          {signUpState.isLoading ? 'Creating Account...' : 'Create Account'}
        </Text>
      </Pressable>

      {/* Social Authentication */}
      {showSocialAuth && enabledProviders.length > 0 && (
        <>
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
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
                  onPress={() => handleSocialSignUp(provider)}
                  disabled={signUpState.isLoading}
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

      {/* Sign In Link */}
      {onSignInPress && (
        <View style={styles.signInContainer}>
          <Text style={styles.signInText}>Already have an account? </Text>
          <Pressable onPress={onSignInPress}>
            <Text style={styles.signInLink}>Sign In</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontWeight: '500'
  },
  termsContainer: {
    marginBottom: 24
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
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
  termsTextContainer: {
    flex: 1
  },
  termsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  termsLink: {
    color: '#007AFF',
    fontWeight: '500'
  },
  signUpButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24
  },
  signUpButtonDisabled: {
    backgroundColor: '#ccc'
  },
  signUpButtonText: {
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
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 24
  },
  signInText: {
    fontSize: 14,
    color: '#666'
  },
  signInLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500'
  }
});