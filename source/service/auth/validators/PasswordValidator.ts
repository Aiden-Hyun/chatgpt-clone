import { ValidationResult } from './EmailValidator';

export interface PasswordStrength {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
}

export class PasswordValidator {
  static validate(password: string): ValidationResult {
    if (!password || password.trim().length === 0) {
      return { isValid: false, error: 'Password is required' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'Password must be at least 8 characters' };
    }

    if (password.length > 128) {
      return { isValid: false, error: 'Password is too long' };
    }

    return { isValid: true, error: null };
  }

  static getStrength(password: string): PasswordStrength {
    let score = 0;
    const feedback: string[] = [];
    
    // Length check
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Common patterns to avoid
    if (/(.)\1{2,}/.test(password)) {
      score = Math.max(0, score - 1);
      feedback.push('Avoid repeated characters');
    }

    if (/123|abc|qwe|password|admin/i.test(password)) {
      score = Math.max(0, score - 2);
      feedback.push('Avoid common patterns');
    }

    // Determine level
    let level: 'weak' | 'medium' | 'strong' | 'very-strong';
    if (score < 3) level = 'weak';
    else if (score < 5) level = 'medium';
    else if (score < 7) level = 'strong';
    else level = 'very-strong';

    // Add positive feedback
    if (password.length >= 12) feedback.push('Good length');
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) feedback.push('Good character variety');
    if (/[0-9]/.test(password)) feedback.push('Contains numbers');
    if (/[^A-Za-z0-9]/.test(password)) feedback.push('Contains special characters');

    return {
      score: Math.min(score, 10),
      level,
      feedback
    };
  }

  static isCommonPassword(password: string): boolean {
    const commonPasswords = [
      'password',
      '123456',
      '123456789',
      'qwerty',
      'abc123',
      'password123',
      'admin',
      'letmein',
      'welcome',
      'monkey'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  static meetsRequirements(password: string, requirements: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {}): ValidationResult {
    const {
      minLength = 8,
      requireUppercase = false,
      requireLowercase = false,
      requireNumbers = false,
      requireSpecialChars = false
    } = requirements;

    if (password.length < minLength) {
      return { isValid: false, error: `Password must be at least ${minLength} characters` };
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one uppercase letter' };
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one lowercase letter' };
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one number' };
    }

    if (requireSpecialChars && !/[^A-Za-z0-9]/.test(password)) {
      return { isValid: false, error: 'Password must contain at least one special character' };
    }

    return { isValid: true, error: null };
  }
}
