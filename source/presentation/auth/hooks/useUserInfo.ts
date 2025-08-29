import { useEffect, useState } from 'react';
import { useUserProfileViewModel } from '../../../business/auth/view-models/useUserProfileViewModel';
import { useUseCaseFactory } from '../../shared/BusinessContextProvider';
import { useAuth } from '../context/AuthContext';

interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing user information from the current session
 * Uses business layer UseCases instead of direct database access
 */
export const useUserInfo = (): UserInfo => {
  const { session } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const useCaseFactory = useUseCaseFactory();
  const userProfileViewModel = useUserProfileViewModel(
    useCaseFactory.createGetUserProfileUseCase(),
    useCaseFactory.createUpdateUserProfileUseCase()
  );

  const getUserInfo = async () => {
    try {
      if (session?.user) {
        // Extract user ID
        setUserId(session.user.id);
        
        // Extract email
        setEmail(session.user.email || null);
        
        // Get profile from business layer
        const result = await userProfileViewModel.getUserProfile(session.user.id);
        
        if (result.success && result.profile) {
          setUserName(result.profile.displayName);
        } else {
          // Fall back to metadata if profile not found
          const name = session.user.user_metadata?.full_name || 
                      session.user.user_metadata?.name || 
                      session.user.email?.split('@')[0] || 
                      'User';
          setUserName(name);
        }
      } else {
        // No session, reset user info
        setUserName('');
        setEmail(null);
        setUserId(null);
      }
    } catch (error) {
      // On error, set default values
      setUserName('User');
      setEmail(null);
      setUserId(null);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setLoading(true);
    await getUserInfo();
  };

  useEffect(() => {
    getUserInfo();
  }, [session]);

  return {
    userName,
    email,
    userId,
    loading,
    refresh,
  };
}; 