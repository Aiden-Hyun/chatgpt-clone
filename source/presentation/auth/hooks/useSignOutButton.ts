import { useState } from 'react';
import { useSignOutViewModel } from '../../../business/auth/view-models/useSignOutViewModel';

export function useSignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const signOutViewModel = useSignOutViewModel();
  
  const signOut = async () => {
    setIsLoading(true);

    try {
      await signOutViewModel.signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signOut,
    isLoading
  };
}
