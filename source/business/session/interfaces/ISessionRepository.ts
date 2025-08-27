import { UserSession } from '../entities/UserSession';

export interface RefreshResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export interface ISessionRepository {
  save(session: UserSession): Promise<void>;
  get(): Promise<UserSession | null>;
  clear(): Promise<void>;
  refresh(refreshToken?: string): Promise<RefreshResult>;
  updateLastActivity(userId: string): Promise<void>;
  isValid(session: UserSession): Promise<boolean>;
  getUserId(): Promise<string | null>;
  hasValidTokens(): Promise<boolean>;
  syncWithSupabase(): Promise<RefreshResult>;
}
