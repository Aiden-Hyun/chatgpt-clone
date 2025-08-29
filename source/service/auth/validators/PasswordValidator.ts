import { IPasswordValidationResult, IPasswordStrengthResult } from '../../interfaces';

export class PasswordValidator {
  // Password requirements configuration
  private static readonly REQUIREMENTS = {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Made optional for better UX
    maxConsecutiveChars: 3
  };

  // Common weak passwords to reject
  private static readonly WEAK_PASSWORDS = [
    'password',
    'password123',
    '123456',
    '123456789',
    'qwerty',
    'abc123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
    'master',
    'shadow',
    'superman',
    'michael',
    'football',
    'baseball',
    'liverpool',
    'jordan',
    'princess'
  ];

  // Common patterns to avoid
  private static readonly WEAK_PATTERNS = [
    /^(.)\1+$/, // All same character (aaaa, 1111)
    /^(012|123|234|345|456|567|678|789|890)+/, // Sequential numbers
    /^(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)+/i, // Sequential letters
    /^(qwe|wer|ert|rty|tyu|yui|uio|iop|asd|sdf|dfg|fgh|ghj|hjk|jkl|zxc|xcv|cvb|vbn|bnm)+/i // Keyboard patterns
  ];

  /**
   * Validate password against security requirements
   * @param password Password to validate
   * @returns Validation result with error message if invalid
   */
  static validate(password: string): IPasswordValidationResult {
    if (!password || typeof password !== 'string') {
      return {
        isValid: false,
        error: 'Password is required'
      };
    }

    const requirements = this.REQUIREMENTS;

    // Check length requirements
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

    // Check for weak passwords
    if (this.isWeakPassword(password)) {
      return {
        isValid: false,
        error: 'This password is too common. Please choose a more secure password'
      };
    }

    // Check for excessive consecutive characters
    if (this.hasExcessiveConsecutiveChars(password)) {
      return {
        isValid: false,
        error: `Password cannot contain more than ${requirements.maxConsecutiveChars} consecutive identical characters`
      };
    }

    // Check for weak patterns
    if (this.hasWeakPatterns(password)) {
      return {
        isValid: false,
        error: 'Password contains predictable patterns. Please choose a more secure password'
      };
    }

    return { isValid: true };
  }

  /**
   * Calculate password strength score and provide feedback
   * @param password Password to analyze
   * @returns Strength analysis with score, level, and feedback
   */
  static getStrength(password: string): IPasswordStrengthResult {
    if (!password || typeof password !== 'string') {
      return {
        score: 0,
        level: 'weak',
        feedback: ['Password is required']
      };
    }

    let score = 0;
    const feedback: string[] = [];

    // Length scoring (0-30 points)
    if (password.length >= 8) {
      score += 15;
    } else {
      feedback.push('Use at least 8 characters');
    }

    if (password.length >= 12) {
      score += 10;
    } else if (password.length >= 8) {
      feedback.push('Consider using 12+ characters for better security');
    }

    if (password.length >= 16) {
      score += 5;
    }

    // Character variety scoring (0-40 points)
    if (/[a-z]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add lowercase letters');
    }

    if (/[A-Z]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add uppercase letters');
    }

    if (/\d/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add numbers');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 10;
    } else {
      feedback.push('Add special characters (!@#$%^&*)');
    }

    // Complexity bonus (0-20 points)
    const uniqueChars = new Set(password).size;
    const uniqueRatio = uniqueChars / password.length;
    
    if (uniqueRatio >= 0.8) {
      score += 10;
    } else if (uniqueRatio >= 0.6) {
      score += 5;
    } else {
      feedback.push('Use more varied characters');
    }

    // Mixed case and numbers bonus
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password)) {
      score += 10;
    }

    // Penalties (negative points)
    if (this.isWeakPassword(password)) {
      score -= 30;
      feedback.push('Avoid common passwords');
    }

    if (this.hasExcessiveConsecutiveChars(password)) {
      score -= 15;
      feedback.push('Avoid repeating characters');
    }

    if (this.hasWeakPatterns(password)) {
      score -= 20;
      feedback.push('Avoid predictable patterns');
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    // Determine strength level
    let level: 'weak' | 'fair' | 'good' | 'strong';
    if (score < 30) {
      level = 'weak';
    } else if (score < 60) {
      level = 'fair';
    } else if (score < 80) {
      level = 'good';
    } else {
      level = 'strong';
    }

    return { score, level, feedback };
  }

  /**
   * Check if password is in the list of common weak passwords
   */
  private static isWeakPassword(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.WEAK_PASSWORDS.some(weak => 
      lowerPassword === weak || 
      lowerPassword.includes(weak) ||
      weak.includes(lowerPassword)
    );
  }

  /**
   * Check for excessive consecutive identical characters
   */
  private static hasExcessiveConsecutiveChars(password: string): boolean {
    let consecutiveCount = 1;
    let lastChar = password[0];

    for (let i = 1; i < password.length; i++) {
      if (password[i] === lastChar) {
        consecutiveCount++;
        if (consecutiveCount > this.REQUIREMENTS.maxConsecutiveChars) {
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
   * Check for weak patterns (sequential, keyboard patterns, etc.)
   */
  private static hasWeakPatterns(password: string): boolean {
    const lowerPassword = password.toLowerCase();
    return this.WEAK_PATTERNS.some(pattern => pattern.test(lowerPassword));
  }

  /**
   * Generate a secure password suggestion
   * @param length Desired password length (default: 12)
   * @returns Generated secure password
   */
  static generateSecurePassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*(),.?":{}|<>';
    
    const allChars = lowercase + uppercase + numbers + specialChars;
    
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password to avoid predictable patterns
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Get password requirements as human-readable text
   */
  static getRequirementsText(): string[] {
    const requirements = this.REQUIREMENTS;
    const text: string[] = [];

    text.push(`At least ${requirements.minLength} characters long`);
    
    if (requirements.requireUppercase) {
      text.push('At least one uppercase letter (A-Z)');
    }
    
    if (requirements.requireLowercase) {
      text.push('At least one lowercase letter (a-z)');
    }
    
    if (requirements.requireNumbers) {
      text.push('At least one number (0-9)');
    }
    
    if (requirements.requireSpecialChars) {
      text.push('At least one special character (!@#$%^&*)');
    }

    text.push('No common passwords or predictable patterns');
    text.push(`No more than ${requirements.maxConsecutiveChars} consecutive identical characters`);

    return text;
  }

  /**
   * Check if two passwords match
   */
  static doPasswordsMatch(password: string, confirmPassword: string): boolean {
    return password === confirmPassword;
  }

  /**
   * Validate password confirmation
   */
  static validateConfirmation(password: string, confirmPassword: string): IPasswordValidationResult {
    if (!confirmPassword) {
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
}