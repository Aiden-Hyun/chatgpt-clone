// Pure message validation service - no external dependencies
import { VALIDATION } from '../utils/constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class MessageValidator {
  static validateMessage(content: string): ValidationResult {
    const errors: string[] = [];

    if (!content || typeof content !== 'string') {
      errors.push('Message content is required');
    } else {
      if (content.trim().length === 0) {
        errors.push('Message cannot be empty');
      }
      
      if (content.length > VALIDATION.MAX_MESSAGE_LENGTH) {
        errors.push(`Message too long (max ${VALIDATION.MAX_MESSAGE_LENGTH} characters)`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateModel(model: string): ValidationResult {
    const errors: string[] = [];

    if (!model || typeof model !== 'string') {
      errors.push('Model is required');
    } else {
      if (model.trim().length === 0) {
        errors.push('Model cannot be empty');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRoomId(roomId: number | null): ValidationResult {
    const errors: string[] = [];

    if (roomId !== null && (!Number.isInteger(roomId) || roomId <= 0)) {
      errors.push('Room ID must be a positive integer');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateUserId(userId: string): ValidationResult {
    const errors: string[] = [];

    if (!userId || typeof userId !== 'string') {
      errors.push('User ID is required');
    } else {
      if (userId.trim().length === 0) {
        errors.push('User ID cannot be empty');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
