// src/lib/supabase/getSession.ts
import type { Session } from "@/entities/session";
import { supabase } from "./index";

export async function getSession(): Promise<Session | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session ?? null;
}
