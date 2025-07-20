// src/lib/supabase/getSession.ts
import { Session } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { supabase } from './index';

/**
 * Gets the current Supabase session and redirects to login if not authenticated
 * @returns The current session or null if not authenticated (after redirect)
 */
export const getSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    router.replace('/login');
    return null;
  }
  
  return session;
};
