import { useEffect, useState } from 'react';

import { Logger } from '../../../service/shared/utils/Logger';
import { useBusinessContext } from '../../shared/BusinessContextProvider';
import { useAuth } from '../context/AuthContext';
import { UserInfo } from '../types/auth.types';

/**
 * Simplified User Info Hook
 * Uses simplified auth context and business layer
 * Matches /src reference pattern but with business layer
 */
export const useUserInfo = (): UserInfo => {
  const { session } = useAuth();
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { useCaseFactory } = useBusinessContext();

  const getUserInfo = async () => {
    try {
      if (session) {
        // Extract user ID and email from session
        setUserId(session.userId);
        setEmail(session.userEmail || null);
        
        // Try to get profile from business layer
        try {
          const getUserProfileUseCase = useCaseFactory.createGetUserProfileUseCase();
          const result = await getUserProfileUseCase.execute({ userId: session.userId });
          
          if (result.success && result.profile) {
            setUserName(result.profile.displayName);
          } else {
            // Fall back to email-based name
            const name = session.userEmail?.split('@')[0] || 'User';
            setUserName(name);
          }
        } catch (error) {
          Logger.warn('useUserInfo: Failed to get profile, using fallback', { error });
          const name = session.userEmail?.split('@')[0] || 'User';
          setUserName(name);
        }
      } else {
        // No session, reset user info
        setUserName('');
        setEmail(null);
        setUserId(null);
      }
    } catch (error) {
      Logger.error('useUserInfo: Failed to get user info', { error });
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