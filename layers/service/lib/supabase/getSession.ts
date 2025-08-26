// src/lib/supabase/getSession.ts
import { Session } from '@supabase/supabase-js';
import { supabase } from './index';

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}
