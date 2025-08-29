import { IValidationResult, ITokenValidationResult } from '../../interfaces';

export class PasswordResetValidator {
  // Token validation patterns
  private static readonly TOKEN_PATTERNS = {
    // Common JWT-like token pattern
    jwt: /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+$/,
    // UUID pattern
    uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    // Alphanumeric token (common for reset tokens)
    alphanumeric: /^[a-zA-Z0-9]+$/,
    // Base64 URL-safe pattern
    base64url: /^[A-Za-z0-9\-_]+$/
  };

  // Password strength requirements
  private static readonly PASSWORD_REQUIREMENTS = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Made optional for better UX
    forbiddenPatterns: [
      /password/i,
      /123456/,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ]
  };

  /**
   * Validate password reset token
   * @param token Reset token to validate
   * @returns Validation result with token details
   */
  static validateResetToken(token: string): ITokenValidationResult {
    if (!token || typeof token !== 'string') {
      return {
        isValid: false,
        error: 'Reset token is required'
      };
    }

    const trimmedToken = token.trim();

    // Check minimum length
    if (trimmedToken.length < 10) {
      return {
        isValid: false,
        error: 'Invalid reset token format'
      };
    }

    // Check maximum length (prevent DoS attacks)
    if (trimmedToken.length > 2048) {
      return {
        isValid: false,
        error: 'Reset token is too long'
      };
    }

    // Determine token type and validate format
    const tokenType = this.determineTokenType(trimmedToken);
    
    if (tokenType === 'unknown') {
      return {
        isValid: false,
        error: 'Invalid reset token format'
      };
    }

    // Additional validation based on token type
    if (tokenType === 'jwt') {
      const jwtValidation = this.validateJWTToken(trimmedToken);
      if (!jwtValidation.isValid) {
        return jwtValidation;
      }
    }

    return {
      isValid: true,
      tokenType
    };
  }

  /**
   * Validate new password for reset
   * @param password New password to validate
   * @returns Validation result
   */
  static validateNewPassword(password: string): IValidationResult {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }

    const requirements = this.PASSWORD_REQUIREMENTS;

    // Check length
    if (password.length < requirements.minLength) {
      return {
        isValid: false,
        error: `Password must be at least ${requirements.minLength} characters long`
      };
    }

    if (password.length > requirements.maxLength) {
      return {
        isValid: false,
        error: `Password must be no more than ${requirements.maxLength} characters long`
      };
    }

    // Check character requirements
    if (requirements.requireUppercase && !/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one uppercase letter'
      };
    }

    if (requirements.requireLowercase && !/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one lowercase letter'
      };
    }

    if (requirements.requireNumbers && !/\d/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one number'
      };
    }

    if (requirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return {
        isValid: false,
        error: 'Password must contain at least one special character'
      };
    }

    // Check for forbidden patterns
    for (const pattern of requirements.forbiddenPatterns) {
      if (pattern.test(password)) {
        return {
          isValid: false,
          error: 'Password contains common words or patterns that are not allowed'
        };
      }
    }

    // Check for repeated characters
    if (this.hasExcessiveRepeatedChars(password)) {
      return {
        isValid: false,
        error: 'Password cannot contain more than 3 consecutive identical characters'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password confirmation match
   * @param password Original password
   * @param confirmPassword Confirmation password
   * @returns Validation result
   */
  static validatePasswordConfirmation(password: string, confirmPassword: string): IValidationResult {
    if (!confirmPassword || typeof confirmPassword !== 'string') {
      return {
        isValid: false,
        error: 'Password confirmation is required'
      };
    }

    if (password !== confirmPassword) {
      return {
        isValid: false,
        error: 'Passwords do not match'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate complete password reset request
   * @param token Reset token
   * @param newPassword New password
   * @param confirmPassword Password confirmation
   * @returns Validation result
   */
  static validatePasswordResetRequest(
    token: string,
    newPassword: string,
    confirmPassword: string
  ): IValidationResult {
    // Validate token
    const tokenValidation = this.validateResetToken(token);
    if (!tokenValidation.isValid) {
      return tokenValidation;
    }

    // Validate new password
    const passwordValidation = this.validateNewPassword(newPassword);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    // Validate password confirmation
    const confirmationValidation = this.validatePasswordConfirmation(newPassword, confirmPassword);
    if (!confirmationValidation.isValid) {
      return confirmationValidation;
    }

    return { isValid: true };
  }

  /**
   * Get password strength score (0-100)
   * @param password Password to analyze
   * @returns Strength score and feedback
   */
  static getPasswordStrength(password: string): {
    score: number;
    level: 'weak' | 'fair' | 'good' | 'strong';
    feedback: string[];
  } {
    if (!password) {
      return {
        score: 0,
        level: 'weak',
        feedback: ['Password is required']
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length scoring
    if (password.length >= 8) score += 20;
    else feedback.push('Use at least 8 characters');

    if (password.length >= 12) score += 10;
    else if (password.length >= 8) feedback.push('Consider using 12+ characters for better security');

    // Character variety scoring
    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('Add uppercase letters');

    if (/\d/.test(password)) score += 15;
    else feedback.push('Add numbers');

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 15;
    else feedback.push('Add special characters for extra security');

    // Complexity bonus
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 10;

    // Penalty for common patterns
    for (const pattern of this.PASSWORD_REQUIREMENTS.forbiddenPatterns) {
      if (pattern.test(password)) {
        score -= 20;
        feedback.push('Avoid common words or patterns');
        break;
      }
    }

    // Penalty for repeated characters
    if (this.hasExcessiveRepeatedChars(password)) {
      score -= 10;
      feedback.push('Avoid repeating characters');
    }

    score = Math.max(0, Math.min(100, score));

    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) level = 'weak';
    else if (score < 60) level = 'fair';
    else if (score < 80) level = 'good';
    else level = 'strong';

    return { score, level, feedback };
  }

  /**
   * Determine token type based on format
   */
  private static determineTokenType(token: string): 'reset' | 'verification' | 'unknown' {
    if (this.TOKEN_PATTERNS.jwt.test(token)) {
      return 'reset'; // Assume JWT tokens are for reset
    }

    if (this.TOKEN_PATTERNS.uuid.test(token)) {
      return 'verification'; // UUIDs often used for verification
    }

    if (this.TOKEN_PATTERNS.alphanumeric.test(token) || this.TOKEN_PATTERNS.base64url.test(token)) {
      return 'reset'; // Common reset token formats
    }

    return 'unknown';
  }

  /**
   * Validate JWT token format (basic validation)
   */
  private static validateJWTToken(token: string): ITokenValidationResult {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return {
          isValid: false,
          error: 'Invalid JWT token format'
        };
      }

      // Try to decode the payload (basic validation)
      const payload = parts[1];
      const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
      
      try {
        const decodedPayload = JSON.parse(atob(paddedPayload.replace(/-/g, '+').replace(/_/g, '/')));
        
        // Check for expiration
        if (decodedPayload.exp) {
          const expiresAt = new Date(decodedPayload.exp * 1000);
          const isExpired = expiresAt <= new Date();
          
          if (isExpired) {
            return {
              isValid: false,
              error: 'Reset token has expired',
              isExpired: true,
              expiresAt
            };
          }
        }
      } catch {
        // If we can't decode, assume it's still valid (server will validate)
      }

      return {
        isValid: true,
        tokenType: 'reset'
      };
    } catch {
      return {
        isValid: false,
        error: 'Invalid JWT token format'
      };
    }
  }

  /**
   * Check for excessive repeated characters
   */
  private static hasExcessiveRepeatedChars(password: string): boolean {
    let consecutiveCount = 1;
    let lastChar = password[0];

    for (let i = 1; i < password.length; i++) {
      if (password[i] === lastChar) {
        consecutiveCount++;
        if (consecutiveCount > 3) {
          return true;
        }
      } else {
        consecutiveCount = 1;
        lastChar = password[i];
      }
    }

    return false;
  }

  /**
   * Generate password requirements text
   */
  static getPasswordRequirementsText(): string[] {
    const requirements = this.PASSWORD_REQUIREMENTS;
    const text: string[] = [];

    text.push(`At least ${requirements.minLength} characters long`);
    
    if (requirements.requireUppercase) {
      text.push('At least one uppercase letter');
    }
    
    if (requirements.requireLowercase) {
      text.push('At least one lowercase letter');
    }
    
    if (requirements.requireNumbers) {
      text.push('At least one number');
    }
    
    if (requirements.requireSpecialChars) {
      text.push('At least one special character');
    }

    text.push('No common words or patterns');

    return text;
  }
}
