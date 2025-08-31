import { ExpiryCalculationResult, TimeUntilExpiryResult, RefreshRecommendation } from '../../interfaces';

export class SessionExpiryCalculator {
  // Default session duration: 24 hours
  private static readonly DEFAULT_SESSION_DURATION_HOURS = 24;
  
  // Default refresh threshold: 5 minutes before expiry
  private static readonly DEFAULT_REFRESH_THRESHOLD_MINUTES = 5;
  
  // Warning threshold: 15 minutes before expiry
  private static readonly WARNING_THRESHOLD_MINUTES = 15;

  /**
   * Calculate session expiry time from current time
   * @param durationHours Duration in hours (default: 24)
   * @returns Expiry date and calculation details
   */
  static calculateExpiryTime(durationHours?: number): ExpiryCalculationResult {
    const duration = durationHours || this.DEFAULT_SESSION_DURATION_HOURS;
    
    if (duration <= 0) {
      return {
        expiryDate: new Date(),
        durationMs: 0,
        isValid: false
      };
    }

    const now = new Date();
    const durationMs = duration * 60 * 60 * 1000; // Convert hours to milliseconds
    const expiryDate = new Date(now.getTime() + durationMs);

    return {
      expiryDate,
      durationMs,
      isValid: true
    };
  }

  /**
   * Calculate expiry time from a specific start time
   * @param startTime Starting time for calculation
   * @param durationHours Duration in hours
   * @returns Expiry date and calculation details
   */
  static calculateExpiryFromTime(startTime: Date, durationHours: number): ExpiryCalculationResult {
    if (durationHours <= 0) {
      return {
        expiryDate: new Date(startTime),
        durationMs: 0,
        isValid: false
      };
    }

    const durationMs = durationHours * 60 * 60 * 1000;
    const expiryDate = new Date(startTime.getTime() + durationMs);

    return {
      expiryDate,
      durationMs,
      isValid: true
    };
  }

  /**
   * Get time remaining until expiry
   * @param expiryDate Session expiry date
   * @returns Time remaining details
   */
  static getTimeUntilExpiry(expiryDate: Date): TimeUntilExpiryResult {
    const now = new Date();
    const timeRemaining = expiryDate.getTime() - now.getTime();
    const isExpired = timeRemaining <= 0;
    
    // Calculate warning threshold
    const warningThreshold = this.WARNING_THRESHOLD_MINUTES * 60 * 1000;
    const isExpiringSoon = !isExpired && timeRemaining <= warningThreshold;

    // Convert to human-readable units
    const totalSeconds = Math.max(0, Math.floor(timeRemaining / 1000));
    const hoursRemaining = Math.floor(totalSeconds / 3600);
    const minutesRemaining = Math.floor((totalSeconds % 3600) / 60);
    const secondsRemaining = totalSeconds % 60;

    return {
      timeRemaining: Math.max(0, timeRemaining),
      isExpired,
      isExpiringSoon,
      hoursRemaining,
      minutesRemaining,
      secondsRemaining
    };
  }

  /**
   * Check if token should be refreshed based on expiry time
   * @param expiryDate Session expiry date
   * @param thresholdMinutes Threshold in minutes (default: 5)
   * @returns Refresh recommendation
   */
  static shouldRefreshToken(
    expiryDate: Date, 
    thresholdMinutes?: number
  ): RefreshRecommendation {
    const threshold = thresholdMinutes || this.DEFAULT_REFRESH_THRESHOLD_MINUTES;
    const thresholdMs = threshold * 60 * 1000;
    
    const timeUntilExpiry = this.getTimeUntilExpiry(expiryDate);
    
    if (timeUntilExpiry.isExpired) {
      return {
        shouldRefresh: true,
        reason: 'Session has expired',
        timeUntilExpiry: timeUntilExpiry.timeRemaining,
        thresholdUsed: threshold
      };
    }

    if (timeUntilExpiry.timeRemaining <= thresholdMs) {
      return {
        shouldRefresh: true,
        reason: `Session expires within ${threshold} minutes`,
        timeUntilExpiry: timeUntilExpiry.timeRemaining,
        thresholdUsed: threshold
      };
    }

    return {
      shouldRefresh: false,
      reason: 'Session is still valid',
      timeUntilExpiry: timeUntilExpiry.timeRemaining,
      thresholdUsed: threshold
    };
  }

  /**
   * Calculate optimal refresh time (when to schedule next refresh check)
   * @param expiryDate Session expiry date
   * @param thresholdMinutes Refresh threshold in minutes
   * @returns Milliseconds until optimal refresh time
   */
  static calculateOptimalRefreshTime(
    expiryDate: Date, 
    thresholdMinutes?: number
  ): number {
    const threshold = thresholdMinutes || this.DEFAULT_REFRESH_THRESHOLD_MINUTES;
    const thresholdMs = threshold * 60 * 1000;
    
    const timeUntilExpiry = this.getTimeUntilExpiry(expiryDate);
    
    if (timeUntilExpiry.isExpired) {
      return 0; // Refresh immediately
    }

    if (timeUntilExpiry.timeRemaining <= thresholdMs) {
      return 0; // Refresh immediately
    }

    // Schedule refresh check for when we hit the threshold
    return timeUntilExpiry.timeRemaining - thresholdMs;
  }

  /**
   * Extend session expiry time
   * @param currentExpiryDate Current expiry date
   * @param extensionHours Hours to extend
   * @returns New expiry date and details
   */
  static extendSessionExpiry(
    currentExpiryDate: Date, 
    extensionHours: number
  ): ExpiryCalculationResult {
    if (extensionHours <= 0) {
      return {
        expiryDate: currentExpiryDate,
        durationMs: 0,
        isValid: false
      };
    }

    const extensionMs = extensionHours * 60 * 60 * 1000;
    const newExpiryDate = new Date(currentExpiryDate.getTime() + extensionMs);

    return {
      expiryDate: newExpiryDate,
      durationMs: extensionMs,
      isValid: true
    };
  }

  /**
   * Check if session is in warning period (expiring soon)
   * @param expiryDate Session expiry date
   * @param warningMinutes Warning threshold in minutes (default: 15)
   * @returns Warning status
   */
  static isInWarningPeriod(
    expiryDate: Date, 
    warningMinutes?: number
  ): {
    inWarning: boolean;
    timeRemaining: number;
    warningThreshold: number;
  } {
    const threshold = warningMinutes || this.WARNING_THRESHOLD_MINUTES;
    const thresholdMs = threshold * 60 * 1000;
    
    const timeUntilExpiry = this.getTimeUntilExpiry(expiryDate);
    
    return {
      inWarning: !timeUntilExpiry.isExpired && timeUntilExpiry.timeRemaining <= thresholdMs,
      timeRemaining: timeUntilExpiry.timeRemaining,
      warningThreshold: threshold
    };
  }

  /**
   * Format time remaining as human-readable string
   * @param expiryDate Session expiry date
   * @returns Formatted time string
   */
  static formatTimeRemaining(expiryDate: Date): string {
    const timeInfo = this.getTimeUntilExpiry(expiryDate);
    
    if (timeInfo.isExpired) {
      return 'Expired';
    }

    const { hoursRemaining, minutesRemaining, secondsRemaining } = timeInfo;

    if (hoursRemaining > 0) {
      return `${hoursRemaining}h ${minutesRemaining}m`;
    } else if (minutesRemaining > 0) {
      return `${minutesRemaining}m ${secondsRemaining}s`;
    } else {
      return `${secondsRemaining}s`;
    }
  }

  /**
   * Get session health status based on expiry
   * @param expiryDate Session expiry date
   * @returns Health status information
   */
  static getSessionHealth(expiryDate: Date): {
    status: 'healthy' | 'warning' | 'expired';
    message: string;
    timeRemaining: number;
    percentage: number; // 0-100, percentage of session time remaining
  } {
    const timeInfo = this.getTimeUntilExpiry(expiryDate);
    const warningInfo = this.isInWarningPeriod(expiryDate);
    
    if (timeInfo.isExpired) {
      return {
        status: 'expired',
        message: 'Session has expired',
        timeRemaining: 0,
        percentage: 0
      };
    }

    if (warningInfo.inWarning) {
      return {
        status: 'warning',
        message: `Session expires in ${this.formatTimeRemaining(expiryDate)}`,
        timeRemaining: timeInfo.timeRemaining,
        percentage: Math.round((timeInfo.timeRemaining / (this.DEFAULT_SESSION_DURATION_HOURS * 60 * 60 * 1000)) * 100)
      };
    }

    return {
      status: 'healthy',
      message: `Session valid for ${this.formatTimeRemaining(expiryDate)}`,
      timeRemaining: timeInfo.timeRemaining,
      percentage: Math.round((timeInfo.timeRemaining / (this.DEFAULT_SESSION_DURATION_HOURS * 60 * 60 * 1000)) * 100)
    };
  }

  /**
   * Calculate session statistics
   * @param createdAt Session creation time
   * @param expiryDate Session expiry date
   * @returns Session statistics
   */
  static getSessionStatistics(createdAt: Date, expiryDate: Date): {
    totalDuration: number;
    timeElapsed: number;
    timeRemaining: number;
    percentageElapsed: number;
    percentageRemaining: number;
    isExpired: boolean;
  } {
    const now = new Date();
    const totalDuration = expiryDate.getTime() - createdAt.getTime();
    const timeElapsed = now.getTime() - createdAt.getTime();
    const timeRemaining = Math.max(0, expiryDate.getTime() - now.getTime());
    
    const percentageElapsed = Math.min(100, Math.round((timeElapsed / totalDuration) * 100));
    const percentageRemaining = Math.max(0, 100 - percentageElapsed);
    
    return {
      totalDuration,
      timeElapsed,
      timeRemaining,
      percentageElapsed,
      percentageRemaining,
      isExpired: timeRemaining === 0
    };
  }
}
