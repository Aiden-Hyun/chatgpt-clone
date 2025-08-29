import { useUseCaseFactory } from '../../shared/BusinessContextProvider';
import { useSignInViewModel } from '../../../business/auth/view-models/useSignInViewModel';

export const useEmailSignin = () => {
  const useCaseFactory = useUseCaseFactory();
  const signInViewModel = useSignInViewModel(useCaseFactory.createSignInUseCase());

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInViewModel.signIn(email, password);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unexpected error';
      return { 
        success: false, 
        data: null, 
        error: errorMessage,
        isNetworkError: false
      };
    }
  };

  return {
    signIn,
    isLoading: signInViewModel.isLoading,
  };
}; 