import { SessionRepository } from '../../../persistence/session/repositories/SessionRepository';
import { UserRepository } from '../../../persistence/auth/repositories/UserRepository';
import { SignInUseCase } from '../use-cases/SignInUseCase';

export function useSignInViewModel() {
  const signInUseCase = new SignInUseCase(
    new UserRepository(),
    new SessionRepository()
  );

  const signIn = async (email: string, password: string) => {
    const result = await signInUseCase.execute({ email, password });
    
    if (result.success) {
      // Navigate to main app
      // Note: In a real app, you'd use a navigation service here
      console.log('Sign in successful, navigating to main app');
    } else {
      throw new Error(result.error);
    }
  };

  return { signIn };
}
