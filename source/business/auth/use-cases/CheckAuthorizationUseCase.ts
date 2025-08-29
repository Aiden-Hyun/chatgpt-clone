import { RoutePermissionChecker } from '../../../service/auth/utils/RoutePermissionChecker';
import { Logger } from '../../../service/shared/utils/Logger';
import { UserSession } from '../../interfaces';
import { ISessionRepository } from '../../interfaces';



export class CheckAuthorizationUseCase {
  constructor(
    private sessionRepository: ISessionRepository
  ) {}

  async execute(request: CheckAuthorizationRequest): Promise<AuthorizationResult> {
    try {
      Logger.info('CheckAuthorizationUseCase: Checking authorization', { 
        route: request.route,
        requiredPermissions: request.requiredPermissions,
        requireAuthentication: request.requireAuthentication 
      });

      // Initialize authorization details
      const authorizationDetails = {
        hasValidSession: false,
        sessionExpired: false,
        hasRequiredPermissions: false,
        userPermissions: [] as string[],
        requiredPermissions: request.requiredPermissions || []
      };

      // Get current session
      const session = await this.sessionRepository.get();
      
      if (!session) {
        Logger.info('CheckAuthorizationUseCase: No session found');
        
        // If authentication is not required, allow access
        if (!request.requireAuthentication && !request.requiredPermissions?.length) {
          return {
            success: true,
            isAuthorized: true,
            isAuthenticated: false,
            authorizationDetails
          };
        }

        return {
          success: true,
          isAuthorized: false,
          isAuthenticated: false,
          redirectTo: '/auth',
          error: 'Authentication required',
          authorizationDetails
        };
      }

      // Check if session is valid and not expired
      const sessionValidation = this.validateSession(session);
      authorizationDetails.hasValidSession = sessionValidation.isValid;
      authorizationDetails.sessionExpired = sessionValidation.isExpired;
      authorizationDetails.userPermissions = session.permissions;

      if (!sessionValidation.isValid) {
        Logger.warn('CheckAuthorizationUseCase: Session is invalid or expired', { 
          userId: session.userId,
          isExpired: sessionValidation.isExpired,
          reason: sessionValidation.reason 
        });

        return {
          success: true,
          isAuthorized: false,
          isAuthenticated: false,
          session,
          redirectTo: '/auth',
          error: sessionValidation.reason,
          authorizationDetails
        };
      }

      // Determine required permissions for the route
      const routePermissions = request.requiredPermissions || 
                              RoutePermissionChecker.getRequiredPermissions(request.route);
      
      authorizationDetails.requiredPermissions = routePermissions;

      // Check permissions if required
      if (routePermissions.length > 0) {
        const permissionCheck = RoutePermissionChecker.canAccessRoute(
          session.permissions,
          routePermissions
        );

        authorizationDetails.hasRequiredPermissions = permissionCheck.hasAccess;

        if (!permissionCheck.hasAccess) {
          Logger.warn('CheckAuthorizationUseCase: Insufficient permissions', { 
            userId: session.userId,
            userPermissions: session.permissions,
            requiredPermissions: routePermissions,
            missingPermissions: permissionCheck.missingPermissions 
          });

          return {
            success: true,
            isAuthorized: false,
            isAuthenticated: true,
            session,
            error: 'Insufficient permissions to access this route',
            missingPermissions: permissionCheck.missingPermissions,
            redirectTo: '/unauthorized',
            authorizationDetails
          };
        }
      } else {
        // No specific permissions required, just authentication
        authorizationDetails.hasRequiredPermissions = true;
      }

      // Authorization successful
      Logger.info('CheckAuthorizationUseCase: Authorization successful', { 
        userId: session.userId,
        route: request.route,
        permissions: session.permissions 
      });

      return {
        success: true,
        isAuthorized: true,
        isAuthenticated: true,
        session,
        authorizationDetails
      };

    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: Authorization check failed', { 
        error,
        route: request.route 
      });

      return {
        success: false,
        isAuthorized: false,
        isAuthenticated: false,
        error: 'Authorization check failed',
        authorizationDetails: {
          hasValidSession: false,
          sessionExpired: false,
          hasRequiredPermissions: false,
          userPermissions: [],
          requiredPermissions: request.requiredPermissions || []
        }
      };
    }
  }

  /**
   * Validate session
   */
  private validateSession(session: UserSession): {
    isValid: boolean;
    isExpired: boolean;
    reason?: string;
  } {
    // Check if session is active
    if (!session.isActive) {
      return {
        isValid: false,
        isExpired: false,
        reason: 'Session is inactive'
      };
    }

    // Check if session has expired
    const now = new Date();
    const isExpired = session.expiresAt <= now;

    if (isExpired) {
      return {
        isValid: false,
        isExpired: true,
        reason: 'Session has expired'
      };
    }

    return {
      isValid: true,
      isExpired: false
    };
  }

  /**
   * Check if user can access a specific route without full authorization flow
   */
  async canAccessRoute(route: string, requiredPermissions?: string[]): Promise<boolean> {
    try {
      const result = await this.execute({
        route,
        requiredPermissions,
        requireAuthentication: true
      });

      return result.success && result.isAuthorized;
    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: Quick route access check failed', { error, route });
      return false;
    }
  }

  /**
   * Get user permissions from current session
   */
  async getUserPermissions(): Promise<string[]> {
    try {
      const session = await this.sessionRepository.get();
      return session?.permissions || [];
    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: Failed to get user permissions', { error });
      return [];
    }
  }

  /**
   * Check if user has specific permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    try {
      const permissions = await this.getUserPermissions();
      return permissions.includes(permission) || permissions.includes('admin');
    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: Permission check failed', { error, permission });
      return false;
    }
  }

  /**
   * Check if user has any of the specified permissions
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions();
      
      // Admin has all permissions
      if (userPermissions.includes('admin')) {
        return true;
      }

      return permissions.some(permission => userPermissions.includes(permission));
    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: Multiple permission check failed', { error, permissions });
      return false;
    }
  }

  /**
   * Check if user has all of the specified permissions
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    try {
      const userPermissions = await this.getUserPermissions();
      
      // Admin has all permissions
      if (userPermissions.includes('admin')) {
        return true;
      }

      return permissions.every(permission => userPermissions.includes(permission));
    } catch (error) {
      Logger.error('CheckAuthorizationUseCase: All permissions check failed', { error, permissions });
      return false;
    }
  }
}
