// src/lib/supabase/index.ts
import { createClient } from '@supabase/supabase-js';
import { appConfig } from '../config';

// Create and export the Supabase client with our new secure config
export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
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
