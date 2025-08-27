import { SignUpUseCase } from '../use-cases/SignUpUseCase';

export function useSignUpViewModel(signUpUseCase: SignUpUseCase) {

  const signUp = async (email: string, password: string, displayName: string, confirmPassword?: string) => {
    const result = await signUpUseCase.execute({ email, password, displayName, confirmPassword });
    
    if (result.success) {
      if (result.requiresEmailVerification) {
        // Navigate to email verification screen
        console.log('Sign up successful, please verify your email');
      } else {
        // Navigate to main app
        console.log('Sign up successful, navigating to main app');
      }
    } else {
      throw new Error(result.error);
    }
  };

  return { signUp };
}
