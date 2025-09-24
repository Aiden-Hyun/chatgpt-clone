import { SignOutUseCase } from '../use-cases/SignOutUseCase';

export function useSignOutViewModel(signOutUseCase: SignOutUseCase) {

  const signOut = async () => {
    await signOutUseCase.execute();
    
    // Navigation should be handled by presentation layer regardless of success
  };

  return { signOut };
}
