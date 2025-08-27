export interface DecodedToken {
  sub: string; // Subject (user ID)
  exp: number; // Expiration time (Unix timestamp)
  iat: number; // Issued at time (Unix timestamp)
  aud: string; // Audience
  iss: string; // Issuer
  email?: string;
  role?: string;
  [key: string]: any;
}

export interface TokenValidationResult {
  isValid: boolean;
  isExpired: boolean;
  expiresAt?: Date;
  userId?: string;
  error?: string;
}

export class TokenValidator {
  private static readonly EXPIRY_BUFFER_MINUTES = 5; // Refresh token 5 minutes before expiry

  /**
   * Check if a JWT token is expired
   * @param token JWT token string
   * @returns true if token is expired or invalid
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) {
        return true; // No expiry means invalid token
      }

      const now = Math.floor(Date.now() / 1000);
      return decoded.exp <= now;
    } catch (error) {
      return true; // Invalid token is considered expired
    }
  }

  /**
   * Check if a token should be refreshed (within buffer time of expiry)
   * @param token JWT token string
   * @returns true if token should be refreshed
   */
  static shouldRefreshToken(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) {
        return true; // No expiry means we should refresh
      }

      const now = Math.floor(Date.now() / 1000);
      const bufferTime = this.EXPIRY_BUFFER_MINUTES * 60;
      return decoded.exp <= (now + bufferTime);
    } catch (error) {
      return true; // Invalid token should be refreshed
    }
  }

  /**
   * Get the expiry date of a JWT token
   * @param token JWT token string
   * @returns Date object representing token expiry
   */
  static getTokenExpiry(token: string): Date {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded.exp) {
        throw new Error('Token has no expiry time');
      }
      return new Date(decoded.exp * 1000);
    } catch (error) {
      throw new Error(`Invalid token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the time until token expiry in milliseconds
   * @param token JWT token string
   * @returns milliseconds until expiry, or 0 if expired
   */
  static getTimeUntilExpiry(token: string): number {
    try {
      const expiryDate = this.getTokenExpiry(token);
      const now = new Date();
      const timeUntilExpiry = expiryDate.getTime() - now.getTime();
      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      return 0; // Invalid or expired token
    }
  }

  /**
   * Decode a JWT token without verification (for client-side use only)
   * @param token JWT token string
   * @returns Decoded token payload
   */
  static decodeToken(token: string): DecodedToken {
    try {
      if (!token || typeof token !== 'string') {
        throw new Error('Invalid token format');
      }

      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      
      // Add padding if needed for base64 decoding
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      
      // Decode base64url
      const decodedPayload = this.base64UrlDecode(paddedPayload);
      
      return JSON.parse(decodedPayload) as DecodedToken;
    } catch (error) {
      throw new Error(`Failed to decode token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate a JWT token comprehensively
   * @param token JWT token string
   * @returns Validation result with details
   */
  static validateToken(token: string): TokenValidationResult {
    try {
      if (!token || typeof token !== 'string') {
        return {
          isValid: false,
          isExpired: true,
          error: 'Invalid token format'
        };
      }

      const decoded = this.decodeToken(token);
      const isExpired = this.isTokenExpired(token);
      const expiresAt = decoded.exp ? new Date(decoded.exp * 1000) : undefined;

      return {
        isValid: !isExpired,
        isExpired,
        expiresAt,
        userId: decoded.sub,
        error: isExpired ? 'Token is expired' : undefined
      };
    } catch (error) {
      return {
        isValid: false,
        isExpired: true,
        error: error instanceof Error ? error.message : 'Token validation failed'
      };
    }
  }

  /**
   * Extract user ID from JWT token
   * @param token JWT token string
   * @returns User ID or null if invalid
   */
  static getUserIdFromToken(token: string): string | null {
    try {
      const decoded = this.decodeToken(token);
      return decoded.sub || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token has specific role
   * @param token JWT token string
   * @param requiredRole Role to check for
   * @returns true if token has the required role
   */
  static hasRole(token: string, requiredRole: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      return decoded.role === requiredRole;
    } catch (error) {
      return false;
    }
  }

  /**
   * Base64URL decode helper
   * @param str Base64URL encoded string
   * @returns Decoded string
   */
  private static base64UrlDecode(str: string): string {
    // Replace URL-safe characters
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (str.length % 4) {
      str += '=';
    }
    
    // Decode base64
    if (typeof atob !== 'undefined') {
      // Browser environment
      return atob(str);
    } else {
      // Node.js environment (for testing)
      return Buffer.from(str, 'base64').toString('utf-8');
    }
  }
}
