// source/service/shared/lib/supabase/getSession.ts
import { Session, SupabaseClient } from '@supabase/supabase-js';

import { ILogger } from '../../../interfaces/core';
import { Logger } from '../../utils/Logger';

import { supabase } from './index';

/**
 * Get the current Supabase session
 * This function accepts an optional Supabase client for DI
 */
export async function getSession(
  client: SupabaseClient = supabase,
  logger: ILogger = new Logger().child('Session')
): Promise<Session | null> {
  try {
    logger.debug('Getting Supabase session');
    const {
      data: { session },
    } = await client.auth.getSession();
    
    if (session) {
      logger.debug('Session found', { userId: session.user?.id });
    } else {
      logger.debug('No active session');
    }
    
    return session ?? null;
  } catch (error) {
    logger.error('Failed to get session', { error });
    return null;
  }
}