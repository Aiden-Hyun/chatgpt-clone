// src/features/chat/services/implementations/SupabaseAuthService.ts
import type { Session } from "@/entities/session";

import { getSession as fetchSession } from "../../../../shared/lib/supabase/getSession";
import { IAuthService } from "../interfaces/IAuthService";

export class SupabaseAuthService implements IAuthService {
  async getSession(): Promise<Session | null> {
    return fetchSession();
  }
}
