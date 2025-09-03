// src/features/chat/services/interfaces/IAuthService.ts
import type { Session } from "@/entities/session";

export interface IAuthService {
  getSession(): Promise<Session | null>;
}
