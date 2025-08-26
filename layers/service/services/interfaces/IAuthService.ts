// src/features/chat/services/interfaces/IAuthService.ts
import { Session } from '@supabase/supabase-js';

export interface IAuthService {
  getSession(): Promise<Session | null>;
}


