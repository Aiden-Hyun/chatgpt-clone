import { SignUpUseCase } from '../use-cases/SignUpUseCase';

export function useSignUpViewModel(signUpUseCase: SignUpUseCase) {

  const signUp = async (email: string, password: string, displayName: string, confirmPassword?: string) => {
    const result = await signUpUseCase.execute({ email, password, displayName, confirmPassword });
    
    if (result.success) {
      // Handle navigation externally in presentation layer
    } else {
      throw new Error(result.error);
    }
  };

  return { signUp };
}
