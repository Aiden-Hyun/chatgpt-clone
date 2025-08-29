import { useSignUpViewModel } from '../../../business/auth/view-models/useSignUpViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export const useEmailSignup = () => {
  const useCaseFactory = useUseCaseFactory();
  const signUpViewModel = useSignUpViewModel(useCaseFactory.createSignUpUseCase());

  const signUp = async (email: string, password: string) => {
    try {
      const result = await signUpViewModel.signUp(email, password);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, data: null, error: errorMessage };
    }
  };

  return {
    signUp,
    isLoading: signUpViewModel.isLoading,
  };
}; 