import { useCallback, useState } from 'react';

import { AuthProvider } from '../../../business/auth/use-cases/SocialAuthUseCase';
import { AuthErrorHandler } from '../../../service/auth/utils/AuthErrorHandler';
import { EmailValidator } from '../../../service/auth/validators/EmailValidator';
import { PasswordResetValidator } from '../../../service/auth/validators/PasswordResetValidator';
import { PasswordValidator } from '../../../service/auth/validators/PasswordValidator';
import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';

import { useAuthNavigation } from './useAuthNavigation';

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpFormValues {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequestValues {
  email: string;
}

export interface ResetFormValues {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthFormState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

export interface UseAuthFormsHook {
  // State
  loginState: AuthFormState;
  signUpState: AuthFormState;
  passwordResetState: AuthFormState;
  resetPasswordState: AuthFormState;

  // Actions
  handleLoginSubmit: (values: LoginFormValues) => Promise<void>;
  handleSignUpSubmit: (values: SignUpFormValues) => Promise<void>;
  handlePasswordResetRequest: (email: string) => Promise<void>;
  handlePasswordResetSubmit: (values: ResetFormValues) => Promise<void>;
  handleSocialAuth: (provider: AuthProvider) => Promise<void>;
  
  // Validation
  validateLoginForm: (values: Partial<LoginFormValues>) => Record<string, string>;
  validateSignUpForm: (values: Partial<SignUpFormValues>) => Record<string, string>;
  validatePasswordResetForm: (values: Partial<PasswordResetRequestValues>) => Record<string, string>;
  validateResetForm: (values: Partial<ResetFormValues>) => Record<string, string>;

  // Utilities
  clearErrors: () => void;
  clearSuccess: () => void;
  getPasswordStrength: (password: string) => {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  };
}

export function useAuthForms(): UseAuthFormsHook {
  const [loginState, setLoginState] = useState<AuthFormState>({
    isLoading: false,
    error: null,
    success: null
  });

  const [signUpState, setSignUpState] = useState<AuthFormState>({
    isLoading: false,
    error: null,
    success: null
  });

  const [passwordResetState, setPasswordResetState] = useState<AuthFormState>({
    isLoading: false,
    error: null,
    success: null
  });

  const [resetPasswordState, setResetPasswordState] = useState<AuthFormState>({
    isLoading: false,
    error: null,
    success: null
  });

  const { useCaseFactory } = useBusinessContext();
  const { handleAuthSuccess, navigateToAuth } = useAuthNavigation();

  /**
   * Handle login form submission
   */
  const handleLoginSubmit = useCallback(async (values: LoginFormValues): Promise<void> => {
    try {
      setLoginState({ isLoading: true, error: null, success: null });
      Logger.info('useAuthForms: Starting login process', { email: values.email });

      // Validate form
      const validationErrors = validateLoginForm(values);
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setLoginState({ isLoading: false, error: firstError, success: null });
        return;
      }

      // Execute sign in use case
      const signInUseCase = useCaseFactory.createSignInUseCase();
      const result = await signInUseCase.execute({
        email: values.email.trim().toLowerCase(),
        password: values.password
      });

      if (result.success) {
        Logger.info('useAuthForms: Login successful');
        setLoginState({ isLoading: false, error: null, success: 'Login successful!' });
        
        // Navigate to protected area
        handleAuthSuccess();
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        Logger.warn('useAuthForms: Login failed', { error: result.error });
        setLoginState({ isLoading: false, error: errorMessage, success: null });
      }
    } catch (error) {
      Logger.error('useAuthForms: Login error', { error });
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setLoginState({ isLoading: false, error: errorMessage, success: null });
    }
  }, [useCaseFactory, handleAuthSuccess, validateLoginForm]);

  /**
   * Handle sign up form submission
   */
  const handleSignUpSubmit = useCallback(async (values: SignUpFormValues): Promise<void> => {
    try {
      setSignUpState({ isLoading: true, error: null, success: null });
      Logger.info('useAuthForms: Starting sign up process', { email: values.email });

      // Validate form
      const validationErrors = validateSignUpForm(values);
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setSignUpState({ isLoading: false, error: firstError, success: null });
        return;
      }

      // Execute sign up use case
      const signUpUseCase = useCaseFactory.createSignUpUseCase();
      const result = await signUpUseCase.execute({
        email: values.email.trim().toLowerCase(),
        password: values.password,
        displayName: values.displayName.trim()
      });

      if (result.success) {
        Logger.info('useAuthForms: Sign up successful');
        
        if (result.requiresEmailVerification) {
          setSignUpState({ 
            isLoading: false, 
            error: null, 
            success: 'Account created! Please check your email to verify your account before signing in.' 
          });
        } else {
          setSignUpState({ 
            isLoading: false, 
            error: null, 
            success: 'Account created successfully! You can now sign in.' 
          });
        }
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        Logger.warn('useAuthForms: Sign up failed', { error: result.error });
        setSignUpState({ isLoading: false, error: errorMessage, success: null });
      }
    } catch (error) {
      Logger.error('useAuthForms: Sign up error', { error });
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setSignUpState({ isLoading: false, error: errorMessage, success: null });
    }
  }, [useCaseFactory, validateSignUpForm]);

  /**
   * Handle password reset request
   */
  const handlePasswordResetRequest = useCallback(async (email: string): Promise<void> => {
    try {
      setPasswordResetState({ isLoading: true, error: null, success: null });
      Logger.info('useAuthForms: Starting password reset request', { email });

      // Validate email
      const validationErrors = validatePasswordResetForm({ email });
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setPasswordResetState({ isLoading: false, error: firstError, success: null });
        return;
      }

      // Execute password reset request use case
      const requestPasswordResetUseCase = useCaseFactory.createRequestPasswordResetUseCase();
      const result = await requestPasswordResetUseCase.execute({
        email: email.trim().toLowerCase()
      });

      if (result.success) {
        Logger.info('useAuthForms: Password reset request successful');
        setPasswordResetState({ 
          isLoading: false, 
          error: null, 
          success: result.message || 'Password reset instructions sent to your email.' 
        });
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        Logger.warn('useAuthForms: Password reset request failed', { error: result.error });
        setPasswordResetState({ isLoading: false, error: errorMessage, success: null });
      }
    } catch (error) {
      Logger.error('useAuthForms: Password reset request error', { error });
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setPasswordResetState({ isLoading: false, error: errorMessage, success: null });
    }
  }, [useCaseFactory, validatePasswordResetForm]);

  /**
   * Handle password reset completion
   */
  const handlePasswordResetSubmit = useCallback(async (values: ResetFormValues): Promise<void> => {
    try {
      setResetPasswordState({ isLoading: true, error: null, success: null });
      Logger.info('useAuthForms: Starting password reset');

      // Validate form
      const validationErrors = validateResetForm(values);
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        setResetPasswordState({ isLoading: false, error: firstError, success: null });
        return;
      }

      // Execute password reset use case
      const resetPasswordUseCase = useCaseFactory.createResetPasswordUseCase();
      const result = await resetPasswordUseCase.execute({
        token: values.token.trim(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (result.success) {
        Logger.info('useAuthForms: Password reset successful');
        setResetPasswordState({ 
          isLoading: false, 
          error: null, 
          success: result.message || 'Password reset successful! You can now sign in with your new password.' 
        });
        
        // Navigate to login after successful reset
        setTimeout(() => {
          navigateToAuth();
        }, 2000);
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        Logger.warn('useAuthForms: Password reset failed', { error: result.error });
        setResetPasswordState({ isLoading: false, error: errorMessage, success: null });
      }
    } catch (error) {
      Logger.error('useAuthForms: Password reset error', { error });
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setResetPasswordState({ isLoading: false, error: errorMessage, success: null });
    }
  }, [useCaseFactory, validateResetForm, navigateToAuth]);

  /**
   * Handle social authentication
   */
  const handleSocialAuth = useCallback(async (provider: AuthProvider): Promise<void> => {
    try {
      setLoginState({ isLoading: true, error: null, success: null });
      Logger.info('useAuthForms: Starting social authentication', { provider });

      // Execute social auth use case
      const socialAuthUseCase = useCaseFactory.createSocialAuthUseCase();
      const result = await socialAuthUseCase.execute({
        provider,
        redirectUrl: `${window.location.origin}/auth/callback`
      });

      if (result.success) {
        Logger.info('useAuthForms: Social authentication successful');
        setLoginState({ isLoading: false, error: null, success: 'Authentication successful!' });
        handleAuthSuccess();
      } else if (result.requiresAdditionalInfo) {
        Logger.info('useAuthForms: Social auth requires additional info');
        setLoginState({ isLoading: false, error: null, success: null });
        // Handle additional info requirement (could navigate to completion form)
      } else {
        const errorMessage = AuthErrorHandler.getMessageFromError(result.error);
        Logger.warn('useAuthForms: Social authentication failed', { error: result.error });
        setLoginState({ isLoading: false, error: errorMessage, success: null });
      }
    } catch (error) {
      Logger.error('useAuthForms: Social authentication error', { error });
      const errorMessage = AuthErrorHandler.getMessageFromError(error);
      setLoginState({ isLoading: false, error: errorMessage, success: null });
    }
  }, [useCaseFactory, handleAuthSuccess]);

  /**
   * Validate login form
   */
  const validateLoginForm = useCallback((values: Partial<LoginFormValues>): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate email
    if (!values.email) {
      errors.email = 'Email is required';
    } else {
      const emailValidation = EmailValidator.validate(values.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Invalid email format';
      }
    }

    // Validate password
    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  }, []);

  /**
   * Validate sign up form
   */
  const validateSignUpForm = useCallback((values: Partial<SignUpFormValues>): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate email
    if (!values.email) {
      errors.email = 'Email is required';
    } else {
      const emailValidation = EmailValidator.validate(values.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Invalid email format';
      }
    }

    // Validate display name
    if (!values.displayName?.trim()) {
      errors.displayName = 'Display name is required';
    } else if (values.displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    }

    // Validate password
    if (!values.password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = PasswordValidator.validate(values.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error || 'Invalid password';
      }
    }

    // Validate password confirmation
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Validate terms acceptance
    if (!values.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    return errors;
  }, []);

  /**
   * Validate password reset form
   */
  const validatePasswordResetForm = useCallback((values: Partial<PasswordResetRequestValues>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else {
      const emailValidation = EmailValidator.validate(values.email);
      if (!emailValidation.isValid) {
        errors.email = emailValidation.error || 'Invalid email format';
      }
    }

    return errors;
  }, []);

  /**
   * Validate reset form
   */
  const validateResetForm = useCallback((values: Partial<ResetFormValues>): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Validate token
    if (!values.token) {
      errors.token = 'Reset token is required';
    } else {
      const tokenValidation = PasswordResetValidator.validateResetToken(values.token);
      if (!tokenValidation.isValid) {
        errors.token = tokenValidation.error || 'Invalid reset token';
      }
    }

    // Validate new password
    if (!values.newPassword) {
      errors.newPassword = 'New password is required';
    } else {
      const passwordValidation = PasswordResetValidator.validateNewPassword(values.newPassword);
      if (!passwordValidation.isValid) {
        errors.newPassword = passwordValidation.error || 'Invalid password';
      }
    }

    // Validate password confirmation
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Password confirmation is required';
    } else if (values.newPassword !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  }, []);

  /**
   * Clear all errors
   */
  const clearErrors = useCallback(() => {
    setLoginState(prev => ({ ...prev, error: null }));
    setSignUpState(prev => ({ ...prev, error: null }));
    setPasswordResetState(prev => ({ ...prev, error: null }));
    setResetPasswordState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear all success messages
   */
  const clearSuccess = useCallback(() => {
    setLoginState(prev => ({ ...prev, success: null }));
    setSignUpState(prev => ({ ...prev, success: null }));
    setPasswordResetState(prev => ({ ...prev, success: null }));
    setResetPasswordState(prev => ({ ...prev, success: null }));
  }, []);

  /**
   * Get password strength
   */
  const getPasswordStrength = useCallback((password: string) => {
    return PasswordResetValidator.getPasswordStrength(password);
  }, []);

  return {
    // State
    loginState,
    signUpState,
    passwordResetState,
    resetPasswordState,

    // Actions
    handleLoginSubmit,
    handleSignUpSubmit,
    handlePasswordResetRequest,
    handlePasswordResetSubmit,
    handleSocialAuth,

    // Validation
    validateLoginForm,
    validateSignUpForm,
    validatePasswordResetForm,
    validateResetForm,

    // Utilities
    clearErrors,
    clearSuccess,
    getPasswordStrength
  };
}
