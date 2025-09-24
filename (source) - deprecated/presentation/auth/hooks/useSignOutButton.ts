import { useState } from 'react';

import { useSignOutViewModel } from '../../../business/auth/view-models/useSignOutViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export function useSignOutButton() {
  const [isLoading, setIsLoading] = useState(false);
  
  const useCaseFactory = useUseCaseFactory();
  const signOutViewModel = useSignOutViewModel(useCaseFactory.createSignOutUseCase());
  
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
