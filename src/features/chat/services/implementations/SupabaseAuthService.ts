// src/features/chat/services/implementations/SupabaseAuthService.ts
import { Session } from '@supabase/supabase-js';
import { getSession as fetchSession } from '../../../../shared/lib/supabase/getSession';
import { IAuthService } from '../interfaces/IAuthService';

export class SupabaseAuthService implements IAuthService {
  async getSession(): Promise<Session | null> {
    return fetchSession();
  }
}


