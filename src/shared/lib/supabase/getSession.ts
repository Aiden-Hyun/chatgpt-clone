// src/lib/supabase/getSession.ts
import { router } from 'expo-router';
import { supabase } from './index';

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    router.replace('/(auth)/login');
    return null;
  }
  
  return session;
};
