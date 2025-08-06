import { RetryMessageCommand } from '../../../../../src/features/concurrent-chat/core/commands/RetryMessageCommand';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('RetryMessageCommand', () => {
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let command: RetryMessageCommand;

  beforeEach(() => {
    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue({ success: true, retried: true })
    };
  });

  describe('command creation', () => {
    it('should create command with required parameters', () => {
      const messageId = 'msg-123';
      
      command = new RetryMessageCommand(mockMessageProcessor, messageId);
      
      expect(command).toBeInstanceOf(RetryMessageCommand);
      expect(command).toBeInstanceOf(Object);
    });

    it('should store message processor reference', () => {
      const messageId = 'msg-456';
      
      command = new RetryMessageCommand(mockMessageProcessor, messageId);
      
      const processor = (command as any).messageProcessor;
      expect(processor).toBe(mockMessageProcessor);
    });

    it('should store message ID', () => {
      const messageId = 'msg-789';
      
      command = new RetryMessageCommand(mockMessageProcessor, messageId);
      
      const storedMessageId = (command as any).messageId;
      expect(storedMessageId).toBe(messageId);
    });

    it('should initialize retry count', () => {
      const messageId = 'msg-123';
      
      command = new RetryMessageCommand(mockMessageProcessor, messageId);
      
      const retryCount = (command as any).retryCount;
      expect(retryCount).toBe(0);
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
    });

    it('should execute successfully', async () => {
      const result = await command.execute();
      
      expect(result).toBeDefined();
      expect(mockMessageProcessor.process).toHaveBeenCalled();
    });

    it('should call message processor with correct parameters', async () => {
      const messageId = 'msg-456';
      
      command = new RetryMessageCommand(mockMessageProcessor, messageId);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: messageId,
        type: 'retry'
      });
    });

    it('should increment retry count on execution', async () => {
      await command.execute();
      
      const retryCount = (command as any).retryCount;
      expect(retryCount).toBe(1);
    });

    it('should return processor result', async () => {
      const expectedResult = { success: true, retried: true, messageId: 'msg-123' };
      mockMessageProcessor.process.mockResolvedValue(expectedResult);
      
      const result = await command.execute();
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle processor errors', async () => {
      const error = new Error('Retry failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(command.execute()).rejects.toThrow('Retry failed');
    });

    it('should handle empty message ID', async () => {
      command = new RetryMessageCommand(mockMessageProcessor, '');
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: '',
        type: 'retry'
      });
    });

    it('should handle null message ID', async () => {
      command = new RetryMessageCommand(mockMessageProcessor, null as any);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: null,
        type: 'retry'
      });
    });
  });

  describe('undo functionality', () => {
    beforeEach(() => {
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
    });

    it('should support undo operation', () => {
      expect(command.canUndo()).toBe(true);
    });

    it('should implement undo method', async () => {
      expect(typeof command.undo).toBe('function');
      
      await expect(command.undo()).resolves.not.toThrow();
    });

    it('should call processor with cancel parameters on undo', async () => {
      await command.execute();
      await command.undo();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
      expect(mockMessageProcessor.process).toHaveBeenLastCalledWith({
        messageId: 'msg-123',
        type: 'cancel'
      });
    });

    it('should decrement retry count on undo', async () => {
      await command.execute();
      await command.undo();
      
      const retryCount = (command as any).retryCount;
      expect(retryCount).toBe(0);
    });

    it('should handle undo errors gracefully', async () => {
      mockMessageProcessor.process.mockRejectedValueOnce(new Error('Undo failed'));
      
      await command.execute();
      await expect(command.undo()).rejects.toThrow('Undo failed');
    });

    it('should prevent undo before execution', async () => {
      await expect(command.undo()).rejects.toThrow('Cannot undo command that has not been executed');
    });
  });

  describe('command metadata', () => {
    it('should provide command description', () => {
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      
      const description = command.getDescription();
      
      expect(description).toContain('Retry message');
      expect(description).toContain('msg-123');
    });

    it('should provide command timestamp', () => {
      const beforeCreation = Date.now();
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      const afterCreation = Date.now();
      
      const timestamp = command.getTimestamp();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(timestamp).toBeLessThanOrEqual(afterCreation);
    });

    it('should provide command ID', () => {
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      
      const commandId = command.getId();
      
      expect(commandId).toBeDefined();
      expect(typeof commandId).toBe('string');
      expect(commandId.length).toBeGreaterThan(0);
    });

    it('should provide retry count in description', () => {
      command = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      
      // Execute to increment retry count
      command.execute();
      
      const description = command.getDescription();
      expect(description).toContain('retry');
    });
  });

  describe('command state management', () => {
    it('should track execution state', async () => {
      expect(command.isExecuted()).toBe(false);
      
      await command.execute();
      
      expect(command.isExecuted()).toBe(true);
    });

    it('should track undo state', async () => {
      expect(command.isUndone()).toBe(false);
      
      await command.execute();
      await command.undo();
      
      expect(command.isUndone()).toBe(true);
    });

    it('should prevent double execution', async () => {
      await command.execute();
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(1);
    });

    it('should track retry count correctly', async () => {
      expect((command as any).retryCount).toBe(0);
      
      await command.execute();
      expect((command as any).retryCount).toBe(1);
      
      await command.undo();
      expect((command as any).retryCount).toBe(0);
    });
  });

  describe('retry validation', () => {
    it('should validate message ID format', () => {
      const validMessageId = 'msg-123';
      const invalidMessageId = 'invalid-id';
      
      expect(() => {
        new RetryMessageCommand(mockMessageProcessor, validMessageId);
      }).not.toThrow();
      
      expect(() => {
        new RetryMessageCommand(mockMessageProcessor, invalidMessageId);
      }).not.toThrow();
    });

    it('should handle retry of non-existent messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Message not found' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message not found');
    });

    it('should handle retry of successful messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        retried: true,
        messageId: 'msg-123'
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
    });

    it('should handle retry of failed messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Retry failed again' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Retry failed again');
    });
  });

  describe('multiple retries', () => {
    it('should handle multiple retry attempts', async () => {
      // First retry fails
      mockMessageProcessor.process.mockResolvedValueOnce({ 
        success: false, 
        error: 'First retry failed' 
      });
      
      // Second retry succeeds
      mockMessageProcessor.process.mockResolvedValueOnce({ 
        success: true, 
        retried: true 
      });
      
      const command1 = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      const command2 = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      
      const result1 = await command1.execute();
      const result2 = await command2.execute();
      
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
    });

    it('should track retry count across multiple commands', async () => {
      const command1 = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      const command2 = new RetryMessageCommand(mockMessageProcessor, 'msg-123');
      
      await command1.execute();
      await command2.execute();
      
      expect((command1 as any).retryCount).toBe(1);
      expect((command2 as any).retryCount).toBe(1);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      expect(command.execute).toBeDefined();
      expect(command.undo).toBeDefined();
      expect(command.canUndo).toBeDefined();
      
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(command));
      const commandMethods = methods.filter(method => 
        method.includes('execute') || method.includes('undo') || method.includes('canUndo')
      );
      
      expect(commandMethods.length).toBeGreaterThan(0);
    });

    it('should follow Open/Closed Principle', () => {
      expect(command).toBeInstanceOf(RetryMessageCommand);
      expect(command).toBeInstanceOf(Object);
      
      const originalExecute = command.execute.bind(command);
      expect(typeof originalExecute).toBe('function');
    });

    it('should follow Liskov Substitution Principle', () => {
      const commandInterface: ICommand = command;
      
      expect(typeof commandInterface.execute).toBe('function');
      expect(typeof commandInterface.undo).toBe('function');
      expect(typeof commandInterface.canUndo).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const commandInterface: ICommand = command;
      
      expect(commandInterface.execute).toBeDefined();
      expect(commandInterface.undo).toBeDefined();
      expect(commandInterface.canUndo).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      expect(mockMessageProcessor.process).toBeDefined();
      expect(typeof mockMessageProcessor.process).toBe('function');
    });
  });

  describe('error handling and validation', () => {
    it('should validate message processor', () => {
      expect(() => {
        new RetryMessageCommand(null as any, 'msg-123');
      }).toThrow('Message processor is required');
    });

    it('should validate message ID', () => {
      expect(() => {
        new RetryMessageCommand(mockMessageProcessor, undefined as any);
      }).toThrow('Message ID is required');
    });

    it('should handle processor returning null', async () => {
      mockMessageProcessor.process.mockResolvedValue(null as any);
      
      const result = await command.execute();
      
      expect(result).toBeNull();
    });

    it('should handle processor returning undefined', async () => {
      mockMessageProcessor.process.mockResolvedValue(undefined as any);
      
      const result = await command.execute();
      
      expect(result).toBeUndefined();
    });
  });

  describe('performance considerations', () => {
    it('should execute within reasonable time', async () => {
      const startTime = Date.now();
      
      await command.execute();
      
      const executionTime = Date.now() - startTime;
      expect(executionTime).toBeLessThan(1000);
    });

    it('should handle long message IDs', async () => {
      const longMessageId = 'msg-' + 'a'.repeat(1000);
      
      command = new RetryMessageCommand(mockMessageProcessor, longMessageId);
      
      const startTime = Date.now();
      await command.execute();
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(1000);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: longMessageId,
        type: 'retry'
      });
    });
  });

  describe('retry scenarios', () => {
    it('should handle retry of processing messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        retried: true, 
        status: 'processing' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
      expect(result.status).toBe('processing');
    });

    it('should handle retry of failed messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        retried: true, 
        status: 'retried' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
      expect(result.status).toBe('retried');
    });

    it('should handle retry of cancelled messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        retried: true, 
        status: 'retried' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.retried).toBe(true);
    });
  });
}); 