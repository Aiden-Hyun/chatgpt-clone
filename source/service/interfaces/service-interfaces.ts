/**
 * Service Layer Specific Interfaces
 * 
 * This file contains interfaces that are specific to the service layer
 * and not imported from the business layer.
 */

// Logger interface
export interface ILogger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

// Message Validator interface
export interface IMessageValidator {
  validateContent(content: string): IValidationResult;
  validateMessageId(messageId: string): IValidationResult;
  validateRoomId(roomId: string): IValidationResult;
}

// Storage enums
export enum WebStorageType {
  LOCAL = 'local',
  SESSION = 'session',
}
