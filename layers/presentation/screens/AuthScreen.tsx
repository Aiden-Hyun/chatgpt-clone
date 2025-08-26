// Clean presentation screen - Pure auth UI with no business logic
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenProps {
  // State
  loading: boolean;
  errors: {
    email?: string;
    password?: string;
    general?: string;
  };
  
  // Actions
  onSignIn: (email: string, password: string) => void;
  onSignUp: (email: string, password: string) => void;
  onForgotPassword: (email: string) => void;
  onNavigateToSignUp: () => void;
  onNavigateToForgotPassword: () => void;
  onNavigateBack: () => void;
  
  // UI Props
  mode: 'signin' | 'signup' | 'forgot-password';
  theme: any;
  translations: {
    signIn?: string;
    signUp?: string;
    forgotPassword?: string;
    email?: string;
    password?: string;
    emailPlaceholder?: string;
    passwordPlaceholder?: string;
    submitButton?: string;
    switchToSignUp?: string;
    switchToSignIn?: string;
    forgotPasswordLink?: string;
    resetPasswordButton?: string;
    backToSignIn?: string;
    title?: string;
    subtitle?: string;
  };
}

/**
 * Pure authentication screen component
 * Contains only UI logic, delegates all business logic to parent
 */
export const AuthScreen: React.FC<AuthScreenProps> = ({
  loading,
  errors,
  onSignIn,
  onSignUp,
  onForgotPassword,
  onNavigateToSignUp,
  onNavigateToForgotPassword,
  onNavigateBack,
  mode,
  theme,
  translations
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const styles = createAuthScreenStyles(theme);

  const handleSubmit = () => {
    if (loading) return;
    
    switch (mode) {
      case 'signin':
        onSignIn(email, password);
        break;
      case 'signup':
        onSignUp(email, password);
        break;
      case 'forgot-password':
        onForgotPassword(email);
        break;
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'signin':
        return translations.signIn || 'Sign In';
      case 'signup':
        return translations.signUp || 'Sign Up';
      case 'forgot-password':
        return translations.forgotPassword || 'Reset Password';
      default:
        return translations.title || 'Welcome';
    }
  };

  const getSubmitButtonText = () => {
    if (loading) return '⏳';
    
    switch (mode) {
      case 'signin':
        return translations.signIn || 'Sign In';
      case 'signup':
        return translations.signUp || 'Sign Up';
      case 'forgot-password':
        return translations.resetPasswordButton || 'Send Reset Email';
      default:
        return translations.submitButton || 'Submit';
    }
  };

  const canSubmit = email.trim().length > 0 && 
    (mode === 'forgot-password' || password.length > 0) && 
    !loading;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            {translations.subtitle && (
              <Text style={styles.subtitle}>{translations.subtitle}</Text>
            )}
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                {translations.email || 'Email'}
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  errors.email && styles.textInputError
                ]}
                value={email}
                onChangeText={setEmail}
                placeholder={translations.emailPlaceholder || 'Enter your email'}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            {/* Password input (hidden for forgot password) */}
            {mode !== 'forgot-password' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  {translations.password || 'Password'}
                </Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.passwordInput,
                      errors.password && styles.textInputError
                    ]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={translations.passwordPlaceholder || 'Enter your password'}
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.passwordToggleText}>
                      {showPassword ? '🙈' : '👁️'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>
            )}

            {/* General error */}
            {errors.general && (
              <View style={styles.generalErrorContainer}>
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            {/* Submit button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                canSubmit ? styles.submitButtonActive : styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit}
            >
              <Text style={[
                styles.submitButtonText,
                canSubmit ? styles.submitButtonTextActive : styles.submitButtonTextDisabled
              ]}>
                {getSubmitButtonText()}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Navigation links */}
          <View style={styles.navigation}>
            {mode === 'signin' && (
              <>
                <TouchableOpacity onPress={onNavigateToForgotPassword}>
                  <Text style={styles.linkText}>
                    {translations.forgotPasswordLink || 'Forgot Password?'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.switchModeButton}
                  onPress={onNavigateToSignUp}
                >
                  <Text style={styles.switchModeText}>
                    {translations.switchToSignUp || "Don't have an account? Sign Up"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {mode === 'signup' && (
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={onNavigateBack}
              >
                <Text style={styles.switchModeText}>
                  {translations.switchToSignIn || 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            )}

            {mode === 'forgot-password' && (
              <TouchableOpacity 
                style={styles.switchModeButton}
                onPress={onNavigateBack}
              >
                <Text style={styles.switchModeText}>
                  {translations.backToSignIn || 'Back to Sign In'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Styles
const createAuthScreenStyles = (theme: any) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center' as const,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  textInputError: {
    borderColor: theme.colors.error,
  },
  passwordContainer: {
    position: 'relative' as const,
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute' as const,
    right: 12,
    top: 12,
    padding: 4,
  },
  passwordToggleText: {
    fontSize: 16,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  generalErrorContainer: {
    backgroundColor: theme.colors.error + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.error,
  },
  generalErrorText: {
    color: theme.colors.error,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    marginTop: 8,
  },
  submitButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButtonTextActive: {
    color: theme.colors.primaryText,
  },
  submitButtonTextDisabled: {
    color: theme.colors.textSecondary,
  },
  navigation: {
    alignItems: 'center' as const,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '500' as const,
    marginBottom: 16,
  },
  switchModeButton: {
    padding: 8,
  },
  switchModeText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center' as const,
  }
});
