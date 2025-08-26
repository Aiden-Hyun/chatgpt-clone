export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export class EmailValidator {
  static validate(email: string): ValidationResult {
    if (!email || email.trim().length === 0) {
      return { isValid: false, error: 'Email is required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    if (email.length > 254) {
      return { isValid: false, error: 'Email is too long' };
    }

    // Check for common disposable email domains
    const disposableDomains = [
      'tempmail.org',
      '10minutemail.com',
      'guerrillamail.com',
      'mailinator.com'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (domain && disposableDomains.includes(domain)) {
      return { isValid: false, error: 'Disposable email addresses are not allowed' };
    }

    return { isValid: true, error: null };
  }

  static getDomain(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[1].toLowerCase() : null;
  }

  static getLocalPart(email: string): string | null {
    const parts = email.split('@');
    return parts.length === 2 ? parts[0] : null;
  }

  static isCorporateEmail(email: string): boolean {
    const domain = this.getDomain(email);
    if (!domain) return false;

    const corporateDomains = [
      'gmail.com',
      'outlook.com',
      'hotmail.com',
      'yahoo.com',
      'icloud.com'
    ];

    return !corporateDomains.includes(domain);
  }
}
