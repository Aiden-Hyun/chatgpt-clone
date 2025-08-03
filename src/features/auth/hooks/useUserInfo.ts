import { useEffect, useState } from 'react';
import { supabase } from '../../../shared/lib/supabase';

interface UserInfo {
  userName: string;
  email: string | null;
  userId: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching and managing user information from the current session
 * Extracts user session data and resolves display name from metadata
 */
export const useUserInfo = (): UserInfo => {
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Extract user ID
        setUserId(session.user.id);
        
        // Extract email
        setEmail(session.user.email || null);
        
        // Try to get display name from profiles table first
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', session.user.id)
          .single();
        
        // Use profile display_name if available, otherwise fall back to metadata
        const name = profileData?.display_name || 
                    session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0] || 
                    'User';
        setUserName(name);
      } else {
        // No session, reset user info
        setUserName('');
        setEmail(null);
        setUserId(null);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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
  }, []);

  return {
    userName,
    email,
    userId,
    loading,
    refresh,
  };
}; 