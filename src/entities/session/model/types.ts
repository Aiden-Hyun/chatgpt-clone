// src/entities/session/model/types.ts

import type { Session } from "@supabase/supabase-js";

export type { Session };

export interface SessionState {
  session: Session | null;
  isLoading: boolean;
}

export interface AuthContextType {
  session: Session | null;
  isLoading: boolean;
}
