import { useState } from 'react';
import { useSignInViewModel } from '../../../business/auth/view-models/useSignInViewModel';

export function useSignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const signInViewModel = useSignInViewModel();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setError(null); // Clear error when user types
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setError(null); // Clear error when user types
  };

  const handleSubmit = async () => {
    // Presentation-level validation
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!password.trim()) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInViewModel.signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    error,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
}
