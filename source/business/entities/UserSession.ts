export class UserSession {
  constructor(
    public readonly userId: string,
    public readonly isAuthenticated: boolean,
    public readonly permissions: string[],
    public readonly lastActivity: Date,
    public readonly expiresAt: Date
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

  refresh(): UserSession {
    const newExpiresAt = new Date();
    newExpiresAt.setHours(newExpiresAt.getHours() + 24); // 24 hour session
    
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      new Date(), // Update last activity
      newExpiresAt
    );
  }

  updateLastActivity(): UserSession {
    return new UserSession(
      this.userId,
      this.isAuthenticated,
      this.permissions,
      new Date(),
      this.expiresAt
    );
  }
}
