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
export class UserSession {
  constructor(
    public readonly userId: string,
    public readonly isAuthenticated: boolean = false,
    public readonly permissions: string[] = [],
    public readonly lastActivity: Date = new Date(),
    public readonly expiresAt: Date = new Date(Date.now() + 24 * 60 * 60 * 1000) // Default 24 hours
  ) {}

  isValid(): boolean {
    return this.isAuthenticated && !this.isExpired();
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isActive(): boolean {
    return this.isAuthenticated && !this.isExpired();
  }
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

// Database session types
export interface DatabaseSession {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface SessionDTO {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
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
