import { useState } from 'react';
import { useSignUpViewModel } from '../../business/view-models/useSignUpViewModel';

export function useSignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const signUpViewModel = useSignUpViewModel();

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
    // Presentation-level validation
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

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUpViewModel.signUp(email, password, displayName);
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
