import { useState } from 'react';

import { useSignUpViewModel } from '../../../business/auth/view-models/useSignUpViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useSignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const useCaseFactory = useUseCaseFactory();
  const signUpViewModel = useSignUpViewModel(useCaseFactory.createSignUpUseCase());

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError(null);
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(null);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setError(null);
  };

  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    setError(null);
  };

  const handleSubmit = async () => {
    // UI-level validation only (empty fields)
    if (!displayName.trim()) {
      setError('Display name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    if (!confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    // Password matching validation - pass to business layer
    setIsLoading(true);
    setError(null);

    try {
      // Pass confirmPassword to business layer for validation
      await signUpViewModel.signUp(email, password, displayName, confirmPassword);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    confirmPassword,
    displayName,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleDisplayNameChange,
    handleSubmit
  };
}
