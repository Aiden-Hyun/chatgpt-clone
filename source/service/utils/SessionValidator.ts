import { UserSession } from '../../business/entities/UserSession';
import { ValidationResult } from '../validators/EmailValidator';

export class SessionValidator {
  static validateSession(session: UserSession): ValidationResult {
    if (!session) {
      return { isValid: false, error: 'Session is null' };
    }

    if (!session.userId || session.userId.trim().length === 0) {
      return { isValid: false, error: 'Session has no user ID' };
    }

    if (!session.isAuthenticated) {
      return { isValid: false, error: 'Session is not authenticated' };
    }

    if (!session.permissions || session.permissions.length === 0) {
      return { isValid: false, error: 'Session has no permissions' };
    }

    if (!session.lastActivity || isNaN(session.lastActivity.getTime())) {
      return { isValid: false, error: 'Session has invalid last activity' };
    }

    if (!session.expiresAt || isNaN(session.expiresAt.getTime())) {
      return { isValid: false, error: 'Session has invalid expiry time' };
    }

    return { isValid: true, error: null };
  }

  static shouldRefreshSession(session: UserSession, thresholdMinutes: number = 15): boolean {
    if (!session || session.isExpired()) {
      return false;
    }

    const timeUntilExpiry = session.getTimeUntilExpiry();
    const thresholdMs = thresholdMinutes * 60 * 1000;
    
    return timeUntilExpiry <= thresholdMs;
  }

  static isSessionSecure(session: UserSession): boolean {
    if (!session) {
      return false;
    }

    const now = new Date();
    const sessionAge = now.getTime() - session.lastActivity.getTime();
    
    // Session shouldn't be older than 30 days
    const maxAgeMs = 30 * 24 * 60 * 60 * 1000;
    if (sessionAge > maxAgeMs) {
      return false;
    }

    // Check for suspicious patterns
    const timeSinceLastActivity = now.getTime() - session.lastActivity.getTime();
    
    // If session hasn't been updated in more than 24 hours, it might be stale
    const maxInactivityMs = 24 * 60 * 60 * 1000;
    if (timeSinceLastActivity > maxInactivityMs) {
      return false;
    }

    // Validate user ID format (basic check)
    if (!this.isValidUserId(session.userId)) {
      return false;
    }

    return true;
  }

  static isValidUserId(userId: string): boolean {
    // Basic validation - user ID should be a non-empty string
    if (!userId || typeof userId !== 'string') {
      return false;
    }

    // Check for common invalid patterns
    if (userId.length < 3 || userId.length > 100) {
      return false;
    }

    // Check for suspicious characters
    const suspiciousPatterns = /[<>\"'&]/;
    if (suspiciousPatterns.test(userId)) {
      return false;
    }

    return true;
  }

  static isSessionExpiringSoon(session: UserSession, minutes: number = 30): boolean {
    if (!session || session.isExpired()) {
      return false;
    }

    const timeUntilExpiry = session.getTimeUntilExpiry();
    const thresholdMs = minutes * 60 * 1000;
    
    return timeUntilExpiry <= thresholdMs;
  }

  static getSessionHealth(session: UserSession): {
    status: 'healthy' | 'warning' | 'critical' | 'expired';
    message: string;
    timeRemaining?: number;
  } {
    if (!session) {
      return { status: 'expired', message: 'No session found' };
    }

    if (session.isExpired()) {
      return { status: 'expired', message: 'Session has expired' };
    }

    const timeRemaining = session.getTimeUntilExpiry();
    const hoursRemaining = timeRemaining / (1000 * 60 * 60);

    if (hoursRemaining < 1) {
      return { 
        status: 'critical', 
        message: 'Session expires in less than 1 hour',
        timeRemaining 
      };
    }

    if (hoursRemaining < 6) {
      return { 
        status: 'warning', 
        message: 'Session expires soon',
        timeRemaining 
      };
    }

    return { 
      status: 'healthy', 
      message: 'Session is healthy',
      timeRemaining 
    };
  }
}
