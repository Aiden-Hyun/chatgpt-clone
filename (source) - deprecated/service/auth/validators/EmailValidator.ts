import { IEmailValidationResult } from '../../interfaces';

export class EmailValidator {
  // RFC 5322 compliant email regex (simplified version)
  private static readonly EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Common disposable email domains to block
  private static readonly DISPOSABLE_DOMAINS = [
    '10minutemail.com',
    'tempmail.org',
    'guerrillamail.com',
    'mailinator.com',
    'yopmail.com',
    'temp-mail.org'
  ];

  // Common typos in popular email domains
  private static readonly DOMAIN_SUGGESTIONS = {
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'hotmial.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com'
  };

  /**
   * Validate email address format and common issues
   * @param email Email address to validate
   * @returns Validation result with error message if invalid
   */
  static validate(email: string): IEmailValidationResult {
    if (!email || typeof email !== 'string') {
      return {
        isValid: false,
        error: 'Email address is required'
      };
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if empty after trimming
    if (!trimmedEmail) {
      return {
        isValid: false,
        error: 'Email address is required'
      };
    }

    // Check length limits
    if (trimmedEmail.length > 254) {
      return {
        isValid: false,
        error: 'Email address is too long'
      };
    }

    // Check basic format
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      };
    }

    // Split email into local and domain parts
    const [localPart, domainPart] = trimmedEmail.split('@');

    // Validate local part (before @)
    const localValidation = this.validateLocalPart(localPart);
    if (!localValidation.isValid) {
      return localValidation;
    }

    // Validate domain part (after @)
    const domainValidation = this.validateDomainPart(domainPart);
    if (!domainValidation.isValid) {
      return domainValidation;
    }

    // Check for disposable email domains (optional - can be disabled for better UX)
    if (this.isDisposableEmail(domainPart)) {
      return {
        isValid: false,
        error: 'Disposable email addresses are not allowed'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate local part of email (before @)
   */
  private static validateLocalPart(localPart: string): IEmailValidationResult {
    if (!localPart) {
      return {
        isValid: false,
        error: 'Email address is missing the local part'
      };
    }

    if (localPart.length > 64) {
      return {
        isValid: false,
        error: 'Email local part is too long'
      };
    }

    // Check for consecutive dots
    if (localPart.includes('..')) {
      return {
        isValid: false,
        error: 'Email address cannot contain consecutive dots'
      };
    }

    // Check for leading or trailing dots
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return {
        isValid: false,
        error: 'Email address cannot start or end with a dot'
      };
    }

    return { isValid: true };
  }

  /**
   * Validate domain part of email (after @)
   */
  private static validateDomainPart(domainPart: string): IEmailValidationResult {
    if (!domainPart) {
      return {
        isValid: false,
        error: 'Email address is missing the domain part'
      };
    }

    if (domainPart.length > 253) {
      return {
        isValid: false,
        error: 'Email domain is too long'
      };
    }

    // Check for valid domain format
    const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domainPart)) {
      return {
        isValid: false,
        error: 'Email domain format is invalid'
      };
    }

    // Check for at least one dot in domain
    if (!domainPart.includes('.')) {
      return {
        isValid: false,
        error: 'Email domain must contain at least one dot'
      };
    }

    // Check TLD length (last part after final dot)
    const tld = domainPart.split('.').pop();
    if (!tld || tld.length < 2) {
      return {
        isValid: false,
        error: 'Email domain must have a valid top-level domain'
      };
    }

    return { isValid: true };
  }

  /**
   * Check if email uses a disposable domain
   */
  private static isDisposableEmail(domain: string): boolean {
    return this.DISPOSABLE_DOMAINS.includes(domain.toLowerCase());
  }

  /**
   * Suggest correction for common email typos
   * @param email Email address to check
   * @returns Suggested correction or null if no suggestion
   */
  static suggestCorrection(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const [localPart, domainPart] = trimmedEmail.split('@');

    if (!localPart || !domainPart) {
      return null;
    }

    // Check for domain suggestions
    const suggestion = this.DOMAIN_SUGGESTIONS[domainPart as keyof typeof this.DOMAIN_SUGGESTIONS];
    if (suggestion) {
      return `${localPart}@${suggestion}`;
    }

    return null;
  }

  /**
   * Extract domain from email address
   * @param email Email address
   * @returns Domain part or null if invalid
   */
  static extractDomain(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const trimmedEmail = email.trim().toLowerCase();
    const parts = trimmedEmail.split('@');

    if (parts.length !== 2) {
      return null;
    }

    return parts[1];
  }

  /**
   * Check if email is from a specific domain
   * @param email Email address
   * @param domain Domain to check against
   * @returns True if email is from the specified domain
   */
  static isFromDomain(email: string, domain: string): boolean {
    const emailDomain = this.extractDomain(email);
    return emailDomain === domain.toLowerCase();
  }

  /**
   * Normalize email address (lowercase, trim)
   * @param email Email address to normalize
   * @returns Normalized email or null if invalid
   */
  static normalize(email: string): string | null {
    if (!email || typeof email !== 'string') {
      return null;
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Basic validation
    if (!this.EMAIL_REGEX.test(trimmedEmail)) {
      return null;
    }

    return trimmedEmail;
  }

  /**
   * Get email validation requirements as text
   */
  static getValidationRequirements(): string[] {
    return [
      'Must be a valid email format (user@domain.com)',
      'Cannot exceed 254 characters',
      'Local part (before @) cannot exceed 64 characters',
      'Must contain exactly one @ symbol',
      'Domain must contain at least one dot',
      'Cannot contain consecutive dots',
      'Cannot start or end with a dot'
    ];
  }
}