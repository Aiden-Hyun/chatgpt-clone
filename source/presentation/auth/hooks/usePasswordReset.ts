import { useRequestPasswordResetViewModel } from '../../../business/auth/view-models/useRequestPasswordResetViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';

export const usePasswordReset = () => {
  const useCaseFactory = useUseCaseFactory();
  const requestPasswordResetViewModel = useRequestPasswordResetViewModel(
    useCaseFactory.createRequestPasswordResetUseCase()
  );

  const resetPassword = async (email: string) => {
    try {
      const result = await requestPasswordResetViewModel.requestReset(email);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return { success: false, error: errorMessage };
    }
  };

  return {
    resetPassword,
    isLoading: requestPasswordResetViewModel.isLoading,
  };
}; 