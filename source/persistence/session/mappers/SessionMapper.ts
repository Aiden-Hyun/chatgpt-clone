import { UserSession } from '../../../business/session/entities/UserSession';

export class SessionMapper {
  toDomain(sessionData: any): UserSession {
    return new UserSession(
      sessionData.userId,
      sessionData.isAuthenticated,
      sessionData.permissions || [],
      new Date(sessionData.lastActivity),
      new Date(sessionData.expiresAt)
    );
  }

  toStorage(session: UserSession): any {
    return {
      userId: session.userId,
      isAuthenticated: session.isAuthenticated,
      permissions: session.permissions,
      lastActivity: session.lastActivity.toISOString(),
      expiresAt: session.expiresAt.toISOString()
    };
  }

  toDatabase(session: UserSession): any {
    return {
      user_id: session.userId,
      is_authenticated: session.isAuthenticated,
      permissions: JSON.stringify(session.permissions),
      last_activity: session.lastActivity.toISOString(),
      expires_at: session.expiresAt.toISOString()
    };
  }

  fromDatabase(dbSession: any): UserSession {
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

  toDTO(session: UserSession): any {
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

  fromDTO(dto: any): UserSession {
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
}
