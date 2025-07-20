// src/lib/supabase/index.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE } from '../constants';

// Create and export the Supabase client
export const supabase = createClient(SUPABASE.URL, SUPABASE.ANON_KEY);
