export class UserSession {
  constructor(
    public readonly userId: string,
    public readonly isAuthenticated: boolean,
    public readonly permissions: string[],
    public readonly lastActivity: Date,
    public readonly expiresAt: Date,
    public readonly refreshToken?: string,
    public readonly accessToken?: string
  ) {}

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return this.isAuthenticated && !this.isExpired();
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  getTimeUntilExpiry(): number {
    const now = new Date();
    return this.expiresAt.getTime() - now.getTime();
  }

  isExpiringSoon(minutes: number = 30): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
    return minutesUntilExpiry <= minutes;
  }

  canRefresh(): boolean {
    return !this.isExpired() && !!this.refreshToken;
  }

  needsRefresh(): boolean {
    return this.isExpiringSoon(15); // 15 minutes before expiry
  }

  refresh(newExpiryTime: Date): UserSession {
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      new Date(), // Update last activity
      newExpiryTime,
      this.refreshToken,
      this.accessToken
    );
  }

  updateLastActivity(): UserSession {
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      new Date(),
      this.expiresAt,
      this.refreshToken,
      this.accessToken
    );
  }

  withTokens(accessToken: string, refreshToken: string): UserSession {
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      this.lastActivity,
      this.expiresAt,
      refreshToken,
      accessToken
    );
  }

  withoutTokens(): UserSession {
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      this.lastActivity,
      this.expiresAt
    );
  }
}
