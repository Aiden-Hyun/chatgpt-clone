import { SessionRepository } from '../../persistence/repositories/SessionRepository';
import { UserRepository } from '../../persistence/repositories/UserRepository';
import { SignOutUseCase } from '../use-cases/SignOutUseCase';

export function useSignOutViewModel() {
  const signOutUseCase = new SignOutUseCase(
    new SessionRepository(),
    new UserRepository()
  );

  const signOut = async () => {
    const result = await signOutUseCase.execute();
    
    if (result.success) {
      // Navigate to auth screen
      console.log('Sign out successful, navigating to auth screen');
    } else {
      // Even if sign out fails, we should still navigate to auth
      console.log('Sign out completed with warnings, navigating to auth screen');
    }
  };

  return { signOut };
}
