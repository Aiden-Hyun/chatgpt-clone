export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface ValidationRule {
  name: string;
  validate: (value: any) => ValidationResult;
}

export class ValidationService {
  private validationRules: Map<string, ValidationRule> = new Map();
  private readonly MAX_MESSAGE_LENGTH = 10000;
  private readonly MAX_MESSAGE_ID_LENGTH = 100;

  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default validation rules.
   */
  private initializeDefaultRules(): void {
    // Message content validation rule
    this.addValidationRule('messageContent', {
      name: 'messageContent',
      validate: (content: any): ValidationResult => {
        const errors: string[] = [];

        if (content === null || content === undefined) {
          errors.push('Message content cannot be null or undefined');
        } else if (typeof content !== 'string') {
          errors.push('Message content must be a string');
        } else if (content.trim() === '') {
          errors.push('Message content cannot be empty');
        } else if (content.length > this.MAX_MESSAGE_LENGTH) {
          errors.push(`Message content cannot exceed ${this.MAX_MESSAGE_LENGTH.toLocaleString()} characters`);
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    // Message ID validation rule
    this.addValidationRule('messageId', {
      name: 'messageId',
      validate: (messageId: any): ValidationResult => {
        const errors: string[] = [];

        if (messageId === null || messageId === undefined) {
          errors.push('Message ID cannot be null or undefined');
        } else if (typeof messageId !== 'string') {
          errors.push('Message ID must be a string');
        } else if (messageId === '') {
          errors.push('Message ID cannot be empty');
        } else if (messageId.length > this.MAX_MESSAGE_ID_LENGTH) {
          errors.push(`Message ID cannot exceed ${this.MAX_MESSAGE_ID_LENGTH} characters`);
        } else if (!this.isValidMessageIdFormat(messageId)) {
          errors.push('Message ID must follow the format: msg_timestamp_random');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    // Room ID validation rule
    this.addValidationRule('roomId', {
      name: 'roomId',
      validate: (roomId: any): ValidationResult => {
        const errors: string[] = [];

        if (roomId === undefined) {
          errors.push('Room ID cannot be undefined');
        } else if (roomId !== null) {
          if (typeof roomId !== 'number') {
            errors.push('Room ID must be an integer');
          } else if (!Number.isInteger(roomId)) {
            errors.push('Room ID must be an integer');
          } else if (roomId <= 0) {
            errors.push('Room ID must be a positive integer');
          } else if (!Number.isSafeInteger(roomId)) {
            errors.push('Room ID must be a safe integer');
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });

    // Model validation rule
    this.addValidationRule('model', {
      name: 'model',
      validate: (model: any): ValidationResult => {
        const errors: string[] = [];

        if (model === null || model === undefined) {
          errors.push('Model cannot be null or undefined');
        } else if (typeof model !== 'string') {
          errors.push('Model must be a string');
        } else if (model.trim() === '') {
          errors.push('Model cannot be empty');
        } else if (!this.isValidModel(model)) {
          errors.push('Model must be one of: gpt-3.5-turbo, gpt-4');
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      }
    });
  }

  /**
   * Validate message content.
   * 
   * @param content - The message content to validate
   * @returns Validation result
   */
  validateMessageContent(content: any): ValidationResult {
    const rule = this.validationRules.get('messageContent');
    if (!rule) {
      return {
        isValid: false,
        errors: ['Message content validation rule not found']
      };
    }
    return rule.validate(content);
  }

  /**
   * Validate message ID.
   * 
   * @param messageId - The message ID to validate
   * @returns Validation result
   */
  validateMessageId(messageId: any): ValidationResult {
    const rule = this.validationRules.get('messageId');
    if (!rule) {
      return {
        isValid: false,
        errors: ['Message ID validation rule not found']
      };
    }
    return rule.validate(messageId);
  }

  /**
   * Validate room ID.
   * 
   * @param roomId - The room ID to validate
   * @returns Validation result
   */
  validateRoomId(roomId: any): ValidationResult {
    const rule = this.validationRules.get('roomId');
    if (!rule) {
      return {
        isValid: false,
        errors: ['Room ID validation rule not found']
      };
    }
    return rule.validate(roomId);
  }

  /**
   * Validate model.
   * 
   * @param model - The model to validate
   * @returns Validation result
   */
  validateModel(model: any): ValidationResult {
    const rule = this.validationRules.get('model');
    if (!rule) {
      return {
        isValid: false,
        errors: ['Model validation rule not found']
      };
    }
    return rule.validate(model);
  }

  /**
   * Add a custom validation rule.
   * 
   * @param name - The name of the validation rule
   * @param rule - The validation rule to add
   */
  addValidationRule(name: string, rule: ValidationRule): void {
    this.validationRules.set(name, rule);
  }

  /**
   * Remove a validation rule.
   * 
   * @param name - The name of the validation rule to remove
   */
  removeValidationRule(name: string): void {
    this.validationRules.delete(name);
  }

  /**
   * Get a validation rule by name.
   * 
   * @param name - The name of the validation rule
   * @returns The validation rule or undefined if not found
   */
  getValidationRule(name: string): ValidationRule | undefined {
    return this.validationRules.get(name);
  }

  /**
   * Validate a custom field using a specific rule.
   * 
   * @param ruleName - The name of the validation rule to use
   * @param value - The value to validate
   * @returns Validation result
   */
  validateCustomField(ruleName: string, value: any): ValidationResult {
    const rule = this.validationRules.get(ruleName);
    if (!rule) {
      return {
        isValid: false,
        errors: [`No validation rule found for field: ${ruleName}`]
      };
    }
    return rule.validate(value);
  }

  /**
   * Validate complete message data.
   * 
   * @param messageData - The message data object to validate
   * @returns Validation result
   */
  validateMessageData(messageData: any): ValidationResult {
    const errors: string[] = [];

    // Validate content if present
    if (messageData.content !== undefined) {
      const contentResult = this.validateMessageContent(messageData.content);
      if (!contentResult.isValid) {
        errors.push(...contentResult.errors);
      }
    }

    // Validate messageId if present
    if (messageData.messageId !== undefined) {
      const messageIdResult = this.validateMessageId(messageData.messageId);
      if (!messageIdResult.isValid) {
        errors.push(...messageIdResult.errors);
      }
    }

    // Validate roomId if present
    if (messageData.roomId !== undefined) {
      const roomIdResult = this.validateRoomId(messageData.roomId);
      if (!roomIdResult.isValid) {
        errors.push(...roomIdResult.errors);
      }
    }

    // Validate model if present
    if (messageData.model !== undefined) {
      const modelResult = this.validateModel(messageData.model);
      if (!modelResult.isValid) {
        errors.push(...modelResult.errors);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Check if a message ID follows the correct format.
   * 
   * @param messageId - The message ID to check
   * @returns True if the format is valid
   */
  private isValidMessageIdFormat(messageId: string): boolean {
    // Format: msg_timestamp_random
    const pattern = /^msg_\d+_[a-zA-Z0-9]+$/;
    return pattern.test(messageId);
  }

  /**
   * Check if a model is valid.
   * 
   * @param model - The model to check
   * @returns True if the model is valid
   */
  private isValidModel(model: string): boolean {
    const validModels = ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini'];
    return validModels.includes(model);
  }

  /**
   * Get all validation rules.
   * 
   * @returns Map of all validation rules
   */
  getAllValidationRules(): Map<string, ValidationRule> {
    return new Map(this.validationRules);
  }

  /**
   * Clear all validation rules.
   */
  clearValidationRules(): void {
    this.validationRules.clear();
    this.initializeDefaultRules();
  }

  /**
   * Get the maximum message length.
   * 
   * @returns Maximum message length
   */
  getMaxMessageLength(): number {
    return this.MAX_MESSAGE_LENGTH;
  }

  /**
   * Get the maximum message ID length.
   * 
   * @returns Maximum message ID length
   */
  getMaxMessageIdLength(): number {
    return this.MAX_MESSAGE_ID_LENGTH;
  }
} 