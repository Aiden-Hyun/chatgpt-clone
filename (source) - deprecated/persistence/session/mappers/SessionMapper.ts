import { SupabaseSession } from '../../interfaces/auth';
import { DatabaseSession, SessionDTO, UserSession } from '../../interfaces/session';

export class SessionMapper {
  toDomain(sessionData: SessionDTO): UserSession {
    return new UserSession(
      sessionData.userId,
      sessionData.isAuthenticated,
      sessionData.permissions || [],
      new Date(sessionData.lastActivity),
      new Date(sessionData.expiresAt),
      sessionData.accessToken,
      sessionData.refreshToken
    );
  }

  toStorage(session: UserSession): SessionDTO {
    return {
      id: session.userId,
      userId: session.userId,
      accessToken: session.accessToken || '',
      refreshToken: session.refreshToken,
      isAuthenticated: session.isAuthenticated,
      permissions: session.permissions,
      lastActivity: session.lastActivity.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as unknown as SessionDTO;
  }

  toDatabase(session: UserSession): DatabaseSession {
    return {
      user_id: session.userId,
      is_authenticated: session.isAuthenticated,
      permissions: JSON.stringify(session.permissions),
      last_activity: session.lastActivity.toISOString(),
      expires_at: session.expiresAt.toISOString()
    };
  }

  fromDatabase(dbSession: DatabaseSession): UserSession {
    return new UserSession(
      dbSession.user_id,
      dbSession.is_authenticated,
      typeof dbSession.permissions === 'string' 
        ? JSON.parse(dbSession.permissions) 
        : dbSession.permissions || [],
      new Date(dbSession.last_activity),
      new Date(dbSession.expires_at)
    );
  }

  toDTO(session: UserSession): SessionDTO {
    return {
      userId: session.userId,
      isAuthenticated: session.isAuthenticated,
      permissions: session.permissions,
      lastActivity: session.lastActivity.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      isExpired: session.isExpired(),
      isActive: session.isActive()
    };
  }

  fromDTO(dto: SessionDTO): UserSession {
    return new UserSession(
      dto.userId,
      dto.isAuthenticated,
      dto.permissions,
      new Date(dto.lastActivity),
      new Date(dto.expiresAt)
    );
  }

  updateSession(session: UserSession, updates: Partial<{
    isAuthenticated: boolean;
    permissions: string[];
    lastActivity: Date;
    expiresAt: Date;
  }>): UserSession {
    return new UserSession(
      session.userId,
      updates.isAuthenticated ?? session.isAuthenticated,
      updates.permissions ?? session.permissions,
      updates.lastActivity ?? session.lastActivity,
      updates.expiresAt ?? session.expiresAt
    );
  }

  /**
   * Map from Supabase session object to UserSession domain entity
   * Follows patterns from /src/features/auth/context/AuthContext.tsx
   */
  fromSupabaseSession(supabaseSession: SupabaseSession): UserSession {
    if (!supabaseSession || !supabaseSession.user) {
      throw new Error('Invalid Supabase session data');
    }

    // Extract user info from Supabase session
    const user = supabaseSession.user;
    const permissions = user.user_metadata?.permissions || ['user']; // Default to 'user' permission
    
    // Calculate expiry from Supabase session
    const expiresAt = supabaseSession.expires_at 
      ? new Date(supabaseSession.expires_at * 1000) // Supabase uses seconds, we use milliseconds
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // Default 24 hours

    return new UserSession(
      user.id,
      true,
      permissions,
      new Date(),
      expiresAt,
      supabaseSession.refresh_token,
      supabaseSession.access_token
    );
  }
}
