// source/service/shared/lib/supabase/index.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { ILogger } from '../../../interfaces/core';
import { Logger } from '../../utils/Logger';
import { IConfigService, appConfig } from '../config';

/**
 * Create a Supabase client with proper configuration
 * This function follows the service layer pattern and accepts dependencies via parameters
 */
export function createSupabaseClient(
  configService: IConfigService,
  logger: ILogger = new Logger().child('Supabase')
): SupabaseClient {
  const url = configService.getSupabaseUrl();
  const key = configService.getSupabaseAnonKey();
  
  logger.debug('Creating Supabase client', { url });
  
  return createClient(url, key, {
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
}

export const supabase = createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'supabase-js-react-native',
    },
  },
});