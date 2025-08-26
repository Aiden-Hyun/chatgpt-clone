import { UserSession } from '../../business/entities/UserSession';

export class ExpiryCalculator {
  static calculateExpiryTime(durationHours: number = 24): Date {
    const now = new Date();
    now.setHours(now.getHours() + durationHours);
    return now;
  }

  static calculateRefreshTime(session: UserSession, bufferMinutes: number = 15): Date {
    const expiryTime = session.expiresAt;
    const bufferMs = bufferMinutes * 60 * 1000;
    return new Date(expiryTime.getTime() - bufferMs);
  }

  static getTimeUntilExpiry(session: UserSession): number {
    const now = new Date();
    return session.expiresAt.getTime() - now.getTime();
  }

  static formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    } else {
      return `${seconds}s remaining`;
    }
  }

  static formatTimeRemainingShort(milliseconds: number): string {
    if (milliseconds <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  static isExpiringWithin(session: UserSession, timeMinutes: number): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry(session);
    const thresholdMs = timeMinutes * 60 * 1000;
    return timeUntilExpiry <= thresholdMs;
  }

  static getOptimalRefreshTime(session: UserSession): Date {
    // Refresh when 15 minutes remain or when 25% of session time is left, whichever is earlier
    const timeUntilExpiry = this.getTimeUntilExpiry(session);
    const sessionDuration = session.expiresAt.getTime() - session.lastActivity.getTime();
    const twentyFivePercent = sessionDuration * 0.25;
    const fifteenMinutes = 15 * 60 * 1000;
    
    const refreshThreshold = Math.min(twentyFivePercent, fifteenMinutes);
    const refreshTime = new Date(session.expiresAt.getTime() - refreshThreshold);
    
    return refreshTime;
  }

  static shouldRefreshNow(session: UserSession): boolean {
    const now = new Date();
    const optimalRefreshTime = this.getOptimalRefreshTime(session);
    return now >= optimalRefreshTime;
  }

  static getSessionAge(session: UserSession): number {
    const now = new Date();
    return now.getTime() - session.lastActivity.getTime();
  }

  static formatSessionAge(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }
  }
}
