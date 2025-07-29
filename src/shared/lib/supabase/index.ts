// src/lib/supabase/index.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE } from '../constants';

// Create and export the Supabase client with React Native compatible options
export const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY, {
  auth: {
    // Enable auto refresh token for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  // Add React Native specific options
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});
