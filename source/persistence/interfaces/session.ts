// Session-related interfaces and types for persistence layer

// Session repository interfaces
export interface SaveSessionResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export interface RefreshResult {
  success: boolean;
  session?: UserSession;
  error?: string;
}

export interface ISessionRepository {
  save(session: UserSession): Promise<SaveSessionResult>;
  get(): Promise<{ success: boolean; session?: UserSession; error?: string }>;
  refresh(): Promise<RefreshResult>;
  clear(): Promise<{ success: boolean; error?: string }>;
}

// Session entity
export interface UserSession {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  isExpired(): boolean;
}

// Session mapper interface
export interface ISessionMapper {
  toEntity(dbSession: unknown): UserSession;
  toDatabase(session: UserSession): unknown;
}

// Session storage adapter interfaces
export interface SessionStorageResult {
  success: boolean;
  error?: string;
}

export interface SessionData {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISessionStorageAdapter {
  save(data: SessionData): Promise<SessionStorageResult>;
  load(): Promise<{ success: boolean; data?: SessionData; error?: string }>;
  clear(): Promise<SessionStorageResult>;
}

// Supabase session adapter interfaces
export interface SupabaseSessionResult {
  success: boolean;
  session?: unknown;
  error?: string;
}

export interface ISupabaseSessionAdapter {
  getSession(): Promise<SupabaseSessionResult>;
  setSession(session: unknown): Promise<{ success: boolean; error?: string }>;
  clearSession(): Promise<{ success: boolean; error?: string }>;
}

// Token repository interfaces
export interface TokenData {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  tokenType: string;
}

export interface ITokenRepository {
  saveTokens(tokens: TokenData): Promise<{ success: boolean; error?: string }>;
  getTokens(): Promise<{ success: boolean; tokens?: TokenData; error?: string }>;
  clearTokens(): Promise<{ success: boolean; error?: string }>;
  refreshTokens(): Promise<{ success: boolean; tokens?: TokenData; error?: string }>;
}
