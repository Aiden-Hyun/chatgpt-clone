import { AuthErrorType, ICategorizedAuthError } from '../../interfaces';

export class AuthErrorHandler {
  private static readonly ERROR_MESSAGES: Record<AuthErrorType, string> = {
    [AuthErrorType.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
    [AuthErrorType.INVALID_CREDENTIALS]: 'Invalid email or password. Please check your credentials and try again.',
    [AuthErrorType.USER_NOT_FOUND]: 'No account found with this email address.',
    [AuthErrorType.EMAIL_NOT_CONFIRMED]: 'Please check your email and click the confirmation link before signing in.',
    [AuthErrorType.WEAK_PASSWORD]: 'Password is too weak. Please choose a stronger password.',
    [AuthErrorType.EMAIL_ALREADY_EXISTS]: 'An account with this email address already exists.',
    [AuthErrorType.INVALID_EMAIL]: 'Please enter a valid email address.',
    [AuthErrorType.TOKEN_EXPIRED]: 'Your session has expired. Please sign in again.',
    [AuthErrorType.INVALID_TOKEN]: 'Invalid authentication token. Please sign in again.',
    [AuthErrorType.SESSION_EXPIRED]: 'Your session has expired. Please sign in again.',
    [AuthErrorType.RATE_LIMIT_EXCEEDED]: 'Too many attempts. Please wait a few minutes before trying again.',
    [AuthErrorType.SERVER_ERROR]: 'Server error occurred. Please try again later.',
    [AuthErrorType.UNKNOWN_ERROR]: 'An unexpected error occurred. Please try again.'
  };

  private static readonly SUPABASE_ERROR_MAPPING: Record<string, AuthErrorType> = {
    // Authentication errors
    'invalid_credentials': AuthErrorType.INVALID_CREDENTIALS,
    'Invalid login credentials': AuthErrorType.INVALID_CREDENTIALS,
    'Email not confirmed': AuthErrorType.EMAIL_NOT_CONFIRMED,
    'User not found': AuthErrorType.USER_NOT_FOUND,
    'weak_password': AuthErrorType.WEAK_PASSWORD,
    'Password should be at least 6 characters': AuthErrorType.WEAK_PASSWORD,
    
    // Email errors
    'User already registered': AuthErrorType.EMAIL_ALREADY_EXISTS,
    'email_address_invalid': AuthErrorType.INVALID_EMAIL,
    'Invalid email': AuthErrorType.INVALID_EMAIL,
    
    // Token errors
    'jwt_expired': AuthErrorType.TOKEN_EXPIRED,
    'invalid_token': AuthErrorType.INVALID_TOKEN,
    'refresh_token_not_found': AuthErrorType.SESSION_EXPIRED,
    'session_not_found': AuthErrorType.SESSION_EXPIRED,
    
    // Rate limiting
    'email_rate_limit_exceeded': AuthErrorType.RATE_LIMIT_EXCEEDED,
    'sms_rate_limit_exceeded': AuthErrorType.RATE_LIMIT_EXCEEDED,
    'over_email_send_rate_limit': AuthErrorType.RATE_LIMIT_EXCEEDED,
    
    // Server errors
    'internal_server_error': AuthErrorType.SERVER_ERROR,
    'service_unavailable': AuthErrorType.SERVER_ERROR,
    'database_error': AuthErrorType.SERVER_ERROR
  };

  /**
   * Categorize an authentication error
   * @param error Error object from Supabase or other auth service
   * @returns Categorized error information
   */
  static categorizeAuthError(error: unknown): ICategorizedAuthError {
    if (!error) {
      return this.createCategorizedError(AuthErrorType.UNKNOWN_ERROR, error);
    }

    // Check for network errors
    if (this.isNetworkError(error)) {
      return this.createCategorizedError(AuthErrorType.NETWORK_ERROR, error, true, true);
    }

    // Extract error message from various error formats
    const errorMessage = this.extractErrorMessage(error);
    const errorCode = this.extractErrorCode(error);

    // Try to map by error code first
    if (errorCode && this.SUPABASE_ERROR_MAPPING[errorCode]) {
      const errorType = this.SUPABASE_ERROR_MAPPING[errorCode];
      return this.createCategorizedError(errorType, error);
    }

    // Try to map by error message
    const mappedType = this.findErrorTypeByMessage(errorMessage);
    if (mappedType) {
      return this.createCategorizedError(mappedType, error);
    }

    // Default to unknown error
    return this.createCategorizedError(AuthErrorType.UNKNOWN_ERROR, error);
  }

  /**
   * Get user-friendly error message for an error type
   * @param errorType Type of authentication error
   * @returns User-friendly error message
   */
  static getErrorMessage(errorType: AuthErrorType): string {
    return this.ERROR_MESSAGES[errorType] || this.ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR];
  }

  /**
   * Get user-friendly error message from any error object
   * @param error Error object
   * @returns User-friendly error message
   */
  static getMessageFromError(error: unknown): string {
    const categorized = this.categorizeAuthError(error);
    return categorized.message;
  }

  /**
   * Check if an error is retryable
   * @param error Error object
   * @returns true if the operation can be retried
   */
  static isRetryableError(error: unknown): boolean {
    const categorized = this.categorizeAuthError(error);
    return categorized.isRetryable;
  }

  /**
   * Check if an error is a network error
   * @param error Error object
   * @returns true if it's a network-related error
   */
  static isNetworkError(error: unknown): boolean {
    if (!error) return false;

    // Check for common network error indicators
    const networkIndicators = [
      'network',
      'connection',
      'timeout',
      'fetch',
      'ECONNREFUSED',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED'
    ];

    const errorString = JSON.stringify(error).toLowerCase();
    return networkIndicators.some(indicator => errorString.includes(indicator));
  }

  /**
   * Create a categorized error object
   */
  private static createCategorizedError(
    type: AuthErrorType,
    originalError?: unknown,
    isRetryable: boolean = false,
    isNetworkError: boolean = false
  ): ICategorizedAuthError {
    // Determine if error is retryable based on type
    const retryable = isRetryable || [
      AuthErrorType.NETWORK_ERROR,
      AuthErrorType.SERVER_ERROR,
      AuthErrorType.RATE_LIMIT_EXCEEDED
    ].includes(type);

    // Determine if error is network-related
    const networkError = isNetworkError || type === AuthErrorType.NETWORK_ERROR;

    return {
      type,
      message: this.getErrorMessage(type),
      isRetryable: retryable,
      isNetworkError: networkError,
      originalError
    };
  }

  /**
   * Extract error message from various error object formats
   */
  private static extractErrorMessage(error: unknown): string {
    if (typeof error === 'string') {
      return error;
    }

    if (error?.message) {
      return error.message;
    }

    if (error?.error_description) {
      return error.error_description;
    }

    if (error?.msg) {
      return error.msg;
    }

    return JSON.stringify(error);
  }

  /**
   * Extract error code from various error object formats
   */
  private static extractErrorCode(error: unknown): string | null {
    if (error?.error) {
      return error.error;
    }

    if (error?.code) {
      return error.code;
    }

    if (error?.error_code) {
      return error.error_code;
    }

    return null;
  }

  /**
   * Find error type by searching error message
   */
  private static findErrorTypeByMessage(message: string): AuthErrorType | null {
    const lowerMessage = message.toLowerCase();

    for (const [supabaseError, errorType] of Object.entries(this.SUPABASE_ERROR_MAPPING)) {
      if (lowerMessage.includes(supabaseError.toLowerCase())) {
        return errorType;
      }
    }

    return null;
  }
}
