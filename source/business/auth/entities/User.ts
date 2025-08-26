export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly displayName: string,
    public readonly avatarUrl: string | null,
    public readonly permissions: string[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  canAccessFeature(feature: string): boolean {
    // Business rules for feature access
    const featurePermissions: Record<string, string[]> = {
      'chat': ['user', 'admin'],
      'admin': ['admin'],
      'premium': ['premium', 'admin'],
      'search': ['user', 'premium', 'admin'],
      'image_generation': ['premium', 'admin']
    };
    
    const requiredPermissions = featurePermissions[feature] || [];
    return requiredPermissions.some((perm: string) => this.hasPermission(perm));
  }

  isAdmin(): boolean {
    return this.hasPermission('admin');
  }

  isPremium(): boolean {
    return this.hasPermission('premium') || this.hasPermission('admin');
  }

  getDisplayName(): string {
    return this.displayName || this.email.split('@')[0];
  }

  getAvatarUrl(): string | null {
    return this.avatarUrl;
  }

  canEditProfile(): boolean {
    return this.hasPermission('user');
  }

  canDeleteAccount(): boolean {
    return this.hasPermission('user');
  }
}
