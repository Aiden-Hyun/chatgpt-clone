// src/entities/session/index.ts

export { AuthProvider, useAuth } from "./hooks/useSession";
export * from "./model/constants";
export * from "./model/types";

// Re-export Session type from Supabase for convenience
export type { Session } from "@supabase/supabase-js";
