import { ConcurrentMessage } from '../messages';

/**
 * Interface for message validation in the concurrent chat system
 * Follows SOLID principles with single responsibility for message validation
 */
export interface IMessageValidator {
  /**
   * Validate a message
   * @param message The message to validate
   * @returns True if the message is valid
   */
  validate(message: ConcurrentMessage): boolean;

  /**
   * Get validation errors for a message
   * @param message The message to validate
   * @returns Array of validation error messages
   */
  getErrors(message: ConcurrentMessage): string[];

  /**
   * Check if a message is required
   * @param message The message to check
   * @returns True if the message is required
   */
  isRequired(message: ConcurrentMessage): boolean;

  /**
   * Get the maximum length allowed for a message
   * @param message The message to check
   * @returns Maximum allowed length
   */
  getMaxLength(message: ConcurrentMessage): number;

  /**
   * Check if a message contains prohibited content
   * @param message The message to check
   * @returns True if the message contains prohibited content
   */
  hasProhibitedContent(message: ConcurrentMessage): boolean;

  /**
   * Sanitize a message to remove prohibited content
   * @param message The message to sanitize
   * @returns Sanitized message
   */
  sanitize(message: ConcurrentMessage): ConcurrentMessage;
} 