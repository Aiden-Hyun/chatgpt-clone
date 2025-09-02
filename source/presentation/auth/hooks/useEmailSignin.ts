/**
 * Simplified Email Sign In Hook
 * Uses business layer through useBusinessAuth hook
 * Matches /src reference pattern but with business layer
 */

import { useBusinessAuth } from './useBusinessAuth';

export const useEmailSignin = () => {
  const { signIn, isLoading } = useBusinessAuth();

  return {
    signIn,
    isLoading,
  };
}; 