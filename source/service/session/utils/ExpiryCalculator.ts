// Service layer utility - pure functions only, no business entity dependencies
export interface SessionTimeData {
  expiresAt: Date;
  lastActivity: Date;
}

export class ExpiryCalculator {
  static calculateExpiryTime(durationHours: number = 24): Date {
    const now = new Date();
    now.setHours(now.getHours() + durationHours);
    return now;
  }

  static calculateRefreshTime(sessionData: SessionTimeData, bufferMinutes: number = 15): Date {
    const expiryTime = sessionData.expiresAt;
    const bufferMs = bufferMinutes * 60 * 1000;
    return new Date(expiryTime.getTime() - bufferMs);
  }

  static getTimeUntilExpiry(sessionData: SessionTimeData): number {
    const now = new Date();
    return sessionData.expiresAt.getTime() - now.getTime();
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

  static isExpiringWithin(sessionData: SessionTimeData, timeMinutes: number): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry(sessionData);
    const thresholdMs = timeMinutes * 60 * 1000;
    return timeUntilExpiry <= thresholdMs;
  }

  static getOptimalRefreshTime(sessionData: SessionTimeData): Date {
    // Refresh when 15 minutes remain or when 25% of session time is left, whichever is earlier
    const sessionDuration = sessionData.expiresAt.getTime() - sessionData.lastActivity.getTime();
    const twentyFivePercent = sessionDuration * 0.25;
    const fifteenMinutes = 15 * 60 * 1000;
    
    const refreshThreshold = Math.min(twentyFivePercent, fifteenMinutes);
    const refreshTime = new Date(sessionData.expiresAt.getTime() - refreshThreshold);
    
    return refreshTime;
  }

  static shouldRefreshNow(sessionData: SessionTimeData): boolean {
    const now = new Date();
    const optimalRefreshTime = this.getOptimalRefreshTime(sessionData);
    return now >= optimalRefreshTime;
  }

  static getSessionAge(sessionData: SessionTimeData): number {
    const now = new Date();
    return now.getTime() - sessionData.lastActivity.getTime();
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
