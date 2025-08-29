import { IPermissionCheckResult, IRouteConfig } from '../../interfaces';

export class RoutePermissionChecker {
  // Define route permissions configuration
  private static readonly ROUTE_PERMISSIONS: Record<string, RouteConfig> = {
    // Public routes (no authentication required)
    '/': { path: '/', permissions: [], requiresAuth: false, description: 'Home page' },
    '/auth': { path: '/auth', permissions: [], requiresAuth: false, description: 'Authentication pages' },
    '/auth/login': { path: '/auth/login', permissions: [], requiresAuth: false, description: 'Login page' },
    '/auth/signup': { path: '/auth/signup', permissions: [], requiresAuth: false, description: 'Sign up page' },
    '/auth/reset-password': { path: '/auth/reset-password', permissions: [], requiresAuth: false, description: 'Password reset' },
    '/auth/callback': { path: '/auth/callback', permissions: [], requiresAuth: false, description: 'OAuth callback' },
    
    // Protected routes (authentication required)
    '/chat': { path: '/chat', permissions: ['user'], requiresAuth: true, description: 'Chat interface' },
    '/chat/[roomId]': { path: '/chat/[roomId]', permissions: ['user'], requiresAuth: true, description: 'Chat room' },
    '/settings': { path: '/settings', permissions: ['user'], requiresAuth: true, description: 'User settings' },
    '/settings/profile': { path: '/settings/profile', permissions: ['user'], requiresAuth: true, description: 'Profile settings' },
    '/settings/privacy': { path: '/settings/privacy', permissions: ['user'], requiresAuth: true, description: 'Privacy settings' },
    '/settings/themes': { path: '/settings/themes', permissions: ['user'], requiresAuth: true, description: 'Theme settings' },
    
    // Admin routes (admin permissions required)
    '/admin': { path: '/admin', permissions: ['admin'], requiresAuth: true, description: 'Admin dashboard' },
    '/admin/users': { path: '/admin/users', permissions: ['admin', 'user-management'], requiresAuth: true, description: 'User management' },
    '/admin/settings': { path: '/admin/settings', permissions: ['admin'], requiresAuth: true, description: 'System settings' },
    '/admin/analytics': { path: '/admin/analytics', permissions: ['admin', 'analytics'], requiresAuth: true, description: 'Analytics dashboard' },
    
    // Moderator routes
    '/moderation': { path: '/moderation', permissions: ['moderator'], requiresAuth: true, description: 'Moderation tools' },
    '/moderation/reports': { path: '/moderation/reports', permissions: ['moderator'], requiresAuth: true, description: 'Content reports' },
    
    // Premium features
    '/premium': { path: '/premium', permissions: ['premium'], requiresAuth: true, description: 'Premium features' },
    '/premium/advanced-chat': { path: '/premium/advanced-chat', permissions: ['premium'], requiresAuth: true, description: 'Advanced chat features' },
    
    // Error pages (public)
    '/unauthorized': { path: '/unauthorized', permissions: [], requiresAuth: false, description: 'Unauthorized access page' },
    '/not-found': { path: '/not-found', permissions: [], requiresAuth: false, description: '404 page' },
    '/error': { path: '/error', permissions: [], requiresAuth: false, description: 'Error page' }
  };

  // Permission hierarchy - higher permissions include lower ones
  private static readonly PERMISSION_HIERARCHY: Record<string, string[]> = {
    'admin': ['admin', 'moderator', 'premium', 'user'],
    'moderator': ['moderator', 'user'],
    'premium': ['premium', 'user'],
    'user': ['user']
  };

  /**
   * Check if user can access a route based on their permissions
   * @param userPermissions User's current permissions
   * @param requiredPermissions Permissions required for the route
   * @returns Permission check result
   */
  static canAccessRoute(
    userPermissions: string[], 
    requiredPermissions: string[]
  ): IPermissionCheckResult {
    // If no permissions are required, allow access
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return {
        hasAccess: true,
        missingPermissions: []
      };
    }

    // If user has no permissions, deny access
    if (!userPermissions || userPermissions.length === 0) {
      return {
        hasAccess: false,
        missingPermissions: requiredPermissions,
        reason: 'User has no permissions'
      };
    }

    // Expand user permissions based on hierarchy
    const expandedUserPermissions = this.expandPermissions(userPermissions);

    // Check if user has any of the required permissions
    const missingPermissions = requiredPermissions.filter(
      required => !expandedUserPermissions.includes(required)
    );

    const hasAccess = missingPermissions.length === 0;

    return {
      hasAccess,
      missingPermissions,
      reason: hasAccess ? undefined : 'Insufficient permissions'
    };
  }

  /**
   * Get required permissions for a specific route
   * @param route Route path to check
   * @returns Array of required permissions
   */
  static getRequiredPermissions(route: string): string[] {
    // Try exact match first
    const exactMatch = this.ROUTE_PERMISSIONS[route];
    if (exactMatch) {
      return exactMatch.permissions;
    }

    // Try pattern matching for dynamic routes
    const matchedRoute = this.findMatchingRoute(route);
    if (matchedRoute) {
      return matchedRoute.permissions;
    }

    // Default: require user permission for unknown routes
    return ['user'];
  }

  /**
   * Check if a route requires authentication
   * @param route Route path to check
   * @returns True if authentication is required
   */
  static requiresAuthentication(route: string): boolean {
    const exactMatch = this.ROUTE_PERMISSIONS[route];
    if (exactMatch) {
      return exactMatch.requiresAuth;
    }

    const matchedRoute = this.findMatchingRoute(route);
    if (matchedRoute) {
      return matchedRoute.requiresAuth;
    }

    // Default: require authentication for unknown routes
    return true;
  }

  /**
   * Check if a route is public (no authentication required)
   * @param route Route path to check
   * @returns True if route is public
   */
  static isPublicRoute(route: string): boolean {
    return !this.requiresAuthentication(route);
  }

  /**
   * Get route configuration
   * @param route Route path
   * @returns Route configuration or null if not found
   */
  static getRouteConfig(route: string): RouteConfig | null {
    const exactMatch = this.ROUTE_PERMISSIONS[route];
    if (exactMatch) {
      return exactMatch;
    }

    return this.findMatchingRoute(route);
  }

  /**
   * Get all available permissions
   * @returns Array of all permission names
   */
  static getAllPermissions(): string[] {
    return Object.keys(this.PERMISSION_HIERARCHY);
  }

  /**
   * Get permissions that a user permission grants access to
   * @param permission Base permission
   * @returns Array of permissions granted by the base permission
   */
  static getGrantedPermissions(permission: string): string[] {
    return this.PERMISSION_HIERARCHY[permission] || [permission];
  }

  /**
   * Check if one permission includes another
   * @param userPermission User's permission
   * @param requiredPermission Required permission
   * @returns True if user permission grants the required permission
   */
  static permissionIncludes(userPermission: string, requiredPermission: string): boolean {
    const grantedPermissions = this.getGrantedPermissions(userPermission);
    return grantedPermissions.includes(requiredPermission);
  }

  /**
   * Get the minimum permission level required for a route
   * @param route Route path
   * @returns Minimum permission level or null if public
   */
  static getMinimumPermissionLevel(route: string): string | null {
    const permissions = this.getRequiredPermissions(route);
    
    if (permissions.length === 0) {
      return null; // Public route
    }

    // Return the lowest level permission that grants access
    const permissionLevels = ['user', 'premium', 'moderator', 'admin'];
    
    for (const level of permissionLevels) {
      const grantedPermissions = this.getGrantedPermissions(level);
      if (permissions.some(required => grantedPermissions.includes(required))) {
        return level;
      }
    }

    return permissions[0]; // Fallback to first required permission
  }

  /**
   * Expand permissions based on hierarchy
   */
  private static expandPermissions(permissions: string[]): string[] {
    const expanded = new Set<string>();
    
    for (const permission of permissions) {
      const granted = this.getGrantedPermissions(permission);
      granted.forEach(p => expanded.add(p));
    }
    
    return Array.from(expanded);
  }

  /**
   * Find matching route using pattern matching
   */
  private static findMatchingRoute(route: string): RouteConfig | null {
    // Handle dynamic routes like /chat/[roomId]
    for (const [pattern, config] of Object.entries(this.ROUTE_PERMISSIONS)) {
      if (this.matchesPattern(route, pattern)) {
        return config;
      }
    }
    
    return null;
  }

  /**
   * Check if a route matches a pattern
   */
  private static matchesPattern(route: string, pattern: string): boolean {
    // Convert pattern to regex
    // [param] becomes ([^/]+)
    // * becomes (.*)
    const regexPattern = pattern
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace(/\*/g, '(.*)');
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(route);
  }

  /**
   * Get user-friendly permission names
   */
  static getPermissionDisplayName(permission: string): string {
    const displayNames: Record<string, string> = {
      'user': 'User',
      'premium': 'Premium User',
      'moderator': 'Moderator',
      'admin': 'Administrator',
      'analytics': 'Analytics Access',
      'user-management': 'User Management'
    };

    return displayNames[permission] || permission.charAt(0).toUpperCase() + permission.slice(1);
  }

  /**
   * Get route display name
   */
  static getRouteDisplayName(route: string): string {
    const config = this.getRouteConfig(route);
    return config?.description || route;
  }

  /**
   * Validate permission configuration
   */
  static validatePermissionConfig(): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check for circular dependencies in permission hierarchy
    for (const [permission, granted] of Object.entries(this.PERMISSION_HIERARCHY)) {
      if (granted.includes(permission)) {
        // This is expected - a permission should include itself
        continue;
      }
      
      // Check for circular references
      const visited = new Set<string>();
      const checkCircular = (perm: string): boolean => {
        if (visited.has(perm)) {
          return true;
        }
        visited.add(perm);
        
        const grantedPerms = this.PERMISSION_HIERARCHY[perm] || [];
        return grantedPerms.some(p => p !== perm && checkCircular(p));
      };
      
      if (checkCircular(permission)) {
        errors.push(`Circular dependency detected in permission hierarchy for: ${permission}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
