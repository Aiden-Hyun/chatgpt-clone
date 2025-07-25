// src/lib/supabase/index.ts
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPABASE } from '../constants';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    flowType: 'pkce',
    persistSession: true,
    detectSessionInUrl: false,
  },
});
