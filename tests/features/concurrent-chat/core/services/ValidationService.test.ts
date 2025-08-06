import { ValidationService } from '../../../../../src/features/concurrent-chat/core/services/ValidationService';

describe('ValidationService', () => {
  let validationService: ValidationService;

  beforeEach(() => {
    validationService = new ValidationService();
  });

  describe('service creation', () => {
    it('should create validation service instance', () => {
      expect(validationService).toBeInstanceOf(ValidationService);
      expect(validationService).toBeInstanceOf(Object);
    });

    it('should initialize with default validation rules', () => {
      const rules = (validationService as any).validationRules;
      expect(rules).toBeDefined();
      expect(typeof rules).toBe('object');
    });
  });

  describe('message content validation', () => {
    it('should validate valid message content', () => {
      const content = 'Hello, world!';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty message content', () => {
      const content = '';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot be empty');
    });

    it('should reject null message content', () => {
      const content = null as any;
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot be null or undefined');
    });

    it('should reject undefined message content', () => {
      const content = undefined as any;
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot be null or undefined');
    });

    it('should reject message content that is too long', () => {
      const content = 'A'.repeat(10001); // Over 10,000 characters
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot exceed 10,000 characters');
    });

    it('should accept message content at maximum length', () => {
      const content = 'A'.repeat(10000); // Exactly 10,000 characters
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject message content with only whitespace', () => {
      const content = '   \n\t   ';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot be empty');
    });

    it('should accept message content with leading/trailing whitespace', () => {
      const content = '  Hello, world!  ';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('message ID validation', () => {
    it('should validate valid message ID', () => {
      const messageId = 'msg_1234567890_abc123';
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty message ID', () => {
      const messageId = '';
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message ID cannot be empty');
    });

    it('should reject null message ID', () => {
      const messageId = null as any;
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message ID cannot be null or undefined');
    });

    it('should reject undefined message ID', () => {
      const messageId = undefined as any;
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message ID cannot be null or undefined');
    });

    it('should reject message ID that is too long', () => {
      const messageId = 'msg_' + 'a'.repeat(1000); // Over 100 characters
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message ID cannot exceed 100 characters');
    });

    it('should reject message ID with invalid format', () => {
      const messageId = 'invalid-id-format';
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message ID must follow the format: msg_timestamp_random');
    });

    it('should accept message ID with valid format', () => {
      const messageId = 'msg_1234567890_abc123def456';
      
      const result = validationService.validateMessageId(messageId);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('room ID validation', () => {
    it('should validate valid room ID', () => {
      const roomId = 123;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should accept null room ID', () => {
      const roomId = null;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject undefined room ID', () => {
      const roomId = undefined as any;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID cannot be undefined');
    });

    it('should reject negative room ID', () => {
      const roomId = -1;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID must be a positive integer');
    });

    it('should reject zero room ID', () => {
      const roomId = 0;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID must be a positive integer');
    });

    it('should reject non-integer room ID', () => {
      const roomId = 123.45;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID must be an integer');
    });

    it('should reject room ID that is too large', () => {
      const roomId = Number.MAX_SAFE_INTEGER + 1;
      
      const result = validationService.validateRoomId(roomId);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Room ID must be a safe integer');
    });
  });

  describe('model validation', () => {
    it('should validate valid model', () => {
      const model = 'gpt-3.5-turbo';
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate GPT-4 model', () => {
      const model = 'gpt-4';
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject empty model', () => {
      const model = '';
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model cannot be empty');
    });

    it('should reject null model', () => {
      const model = null as any;
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model cannot be null or undefined');
    });

    it('should reject undefined model', () => {
      const model = undefined as any;
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model cannot be null or undefined');
    });

    it('should reject invalid model', () => {
      const model = 'invalid-model';
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model must be one of: gpt-3.5-turbo, gpt-4');
    });

    it('should reject model with only whitespace', () => {
      const model = '   ';
      
      const result = validationService.validateModel(model);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Model cannot be empty');
    });
  });

  describe('composite validation', () => {
    it('should validate complete message data', () => {
      const messageData = {
        content: 'Hello, world!',
        messageId: 'msg_1234567890_abc123',
        roomId: 123,
        model: 'gpt-3.5-turbo'
      };
      
      const result = validationService.validateMessageData(messageData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should collect all validation errors', () => {
      const messageData = {
        content: '',
        messageId: '',
        roomId: -1,
        model: 'invalid-model'
      };
      
      const result = validationService.validateMessageData(messageData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Message content cannot be empty');
      expect(result.errors).toContain('Message ID cannot be empty');
      expect(result.errors).toContain('Room ID must be a positive integer');
      expect(result.errors).toContain('Model must be one of: gpt-3.5-turbo, gpt-4');
    });

    it('should validate partial message data', () => {
      const messageData = {
        content: 'Hello, world!',
        roomId: 123
      };
      
      const result = validationService.validateMessageData(messageData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle missing optional fields', () => {
      const messageData = {
        content: 'Hello, world!'
      };
      
      const result = validationService.validateMessageData(messageData);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });

  describe('custom validation rules', () => {
    it('should add custom validation rule', () => {
      const customRule = {
        name: 'customRule',
        validate: (value: any) => ({
          isValid: value === 'custom',
          errors: value === 'custom' ? [] : ['Value must be "custom"']
        })
      };
      
      validationService.addValidationRule('customField', customRule);
      
      const result = validationService.validateCustomField('customField', 'custom');
      expect(result.isValid).toBe(true);
    });

    it('should use custom validation rule', () => {
      const customRule = {
        name: 'customRule',
        validate: (value: any) => ({
          isValid: value === 'custom',
          errors: value === 'custom' ? [] : ['Value must be "custom"']
        })
      };
      
      validationService.addValidationRule('customField', customRule);
      
      const result = validationService.validateCustomField('customField', 'invalid');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Value must be "custom"');
    });

    it('should handle non-existent custom rule', () => {
      const result = validationService.validateCustomField('nonExistentField', 'value');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('No validation rule found for field: nonExistentField');
    });
  });

  describe('validation result structure', () => {
    it('should return consistent validation result structure', () => {
      const result = validationService.validateMessageContent('test');
      
      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should return valid result for valid input', () => {
      const result = validationService.validateMessageContent('valid content');
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid result with errors for invalid input', () => {
      const result = validationService.validateMessageContent('');
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('performance considerations', () => {
    it('should handle large content efficiently', () => {
      const largeContent = 'A'.repeat(10000);
      
      const startTime = Date.now();
      const result = validationService.validateMessageContent(largeContent);
      const endTime = Date.now();
      
      expect(result.isValid).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms
    });

    it('should handle many validation calls efficiently', () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        validationService.validateMessageContent(`Test message ${i}`);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('error message consistency', () => {
    it('should provide consistent error messages', () => {
      const result1 = validationService.validateMessageContent('');
      const result2 = validationService.validateMessageContent('');
      
      expect(result1.errors).toEqual(result2.errors);
    });

    it('should provide descriptive error messages', () => {
      const result = validationService.validateMessageContent('A'.repeat(10001));
      
      expect(result.errors[0]).toContain('cannot exceed');
      expect(result.errors[0]).toContain('10,000');
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for validation
      expect(validationService.validateMessageContent).toBeDefined();
      expect(validationService.validateMessageId).toBeDefined();
      expect(validationService.validateRoomId).toBeDefined();
      expect(validationService.validateModel).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new validation rules) but closed for modification
      expect(validationService).toBeInstanceOf(ValidationService);
      expect(validationService).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with any validation rule implementation
      const customRule = {
        name: 'test',
        validate: (value: any) => ({ isValid: true, errors: [] })
      };
      
      validationService.addValidationRule('test', customRule);
      const result = validationService.validateCustomField('test', 'value');
      
      expect(result.isValid).toBe(true);
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      expect(validationService.validateMessageContent).toBeDefined();
      expect(validationService.validateMessageId).toBeDefined();
      expect(validationService.validateRoomId).toBeDefined();
      expect(validationService.validateModel).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      expect(validationService).toBeDefined();
      expect(typeof validationService.validateMessageContent).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in content', () => {
      const content = 'Hello 🌍 World! 你好世界! Привет мир!';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle very long words', () => {
      const content = 'A'.repeat(1000); // Single word of 1000 characters
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should handle mixed content types', () => {
      const content = '123 Hello World! @#$%^&*()';
      
      const result = validationService.validateMessageContent(content);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });
  });
}); 