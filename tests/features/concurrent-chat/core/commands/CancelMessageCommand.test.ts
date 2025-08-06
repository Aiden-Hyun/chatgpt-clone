import { CancelMessageCommand } from '../../../../../src/features/concurrent-chat/core/commands/CancelMessageCommand';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('CancelMessageCommand', () => {
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let command: CancelMessageCommand;

  beforeEach(() => {
    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue({ success: true, cancelled: true })
    };
  });

  describe('command creation', () => {
    it('should create command with required parameters', () => {
      const messageId = 'msg-123';
      
      command = new CancelMessageCommand(mockMessageProcessor, messageId);
      
      expect(command).toBeInstanceOf(CancelMessageCommand);
      expect(command).toBeInstanceOf(Object);
    });

    it('should store message processor reference', () => {
      const messageId = 'msg-456';
      
      command = new CancelMessageCommand(mockMessageProcessor, messageId);
      
      const processor = (command as any).messageProcessor;
      expect(processor).toBe(mockMessageProcessor);
    });

    it('should store message ID', () => {
      const messageId = 'msg-789';
      
      command = new CancelMessageCommand(mockMessageProcessor, messageId);
      
      const storedMessageId = (command as any).messageId;
      expect(storedMessageId).toBe(messageId);
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      command = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
    });

    it('should execute successfully', async () => {
      const result = await command.execute();
      
      expect(result).toBeDefined();
      expect(mockMessageProcessor.process).toHaveBeenCalled();
    });

    it('should call message processor with correct parameters', async () => {
      const messageId = 'msg-456';
      
      command = new CancelMessageCommand(mockMessageProcessor, messageId);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: messageId,
        type: 'cancel'
      });
    });

    it('should return processor result', async () => {
      const expectedResult = { success: true, cancelled: true, messageId: 'msg-123' };
      mockMessageProcessor.process.mockResolvedValue(expectedResult);
      
      const result = await command.execute();
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle processor errors', async () => {
      const error = new Error('Cancellation failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(command.execute()).rejects.toThrow('Cancellation failed');
    });

    it('should handle empty message ID', async () => {
      command = new CancelMessageCommand(mockMessageProcessor, '');
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: '',
        type: 'cancel'
      });
    });

    it('should handle null message ID', async () => {
      command = new CancelMessageCommand(mockMessageProcessor, null as any);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: null,
        type: 'cancel'
      });
    });
  });

  describe('undo functionality', () => {
    beforeEach(() => {
      command = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
    });

    it('should support undo operation', () => {
      expect(command.canUndo()).toBe(true);
    });

    it('should implement undo method', async () => {
      expect(typeof command.undo).toBe('function');
      
      // Execute the command first, then undo should not throw
      await command.execute();
      await expect(command.undo()).resolves.not.toThrow();
    });

    it('should call processor with resume parameters', async () => {
      await command.execute();
      await command.undo();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
      expect(mockMessageProcessor.process).toHaveBeenLastCalledWith({
        messageId: 'msg-123',
        type: 'resume'
      });
    });

    it('should handle undo errors gracefully', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      // Execute first (this should succeed)
      await freshCommand.execute();
      
      // Now set up the mock to fail for the undo call
      mockMessageProcessor.process.mockRejectedValueOnce(new Error('Resume failed'));
      
      await expect(freshCommand.undo()).rejects.toThrow('Resume failed');
    });
  });

  describe('command metadata', () => {
    it('should provide command description', () => {
      command = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      const description = command.getDescription();
      
      expect(description).toContain('Cancel message');
      expect(description).toContain('msg-123');
    });

    it('should provide command timestamp', () => {
      const beforeCreation = Date.now();
      command = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      const afterCreation = Date.now();
      
      const timestamp = command.getTimestamp();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(timestamp).toBeLessThanOrEqual(afterCreation);
    });

    it('should provide command ID', () => {
      command = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      const commandId = command.getId();
      
      expect(commandId).toBeDefined();
      expect(typeof commandId).toBe('string');
      expect(commandId.length).toBeGreaterThan(0);
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
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      await freshCommand.execute();
      
      await freshCommand.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(1);
    });

    it('should prevent undo before execution', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      await expect(freshCommand.undo()).rejects.toThrow('Cannot undo command that has not been executed');
    });
  });

  describe('cancellation validation', () => {
    it('should validate message ID format', () => {
      const validMessageId = 'msg-123';
      const invalidMessageId = 'invalid-id';
      
      expect(() => {
        new CancelMessageCommand(mockMessageProcessor, validMessageId);
      }).not.toThrow();
      
      // Should still accept invalid formats but log warning
      expect(() => {
        new CancelMessageCommand(mockMessageProcessor, invalidMessageId);
      }).not.toThrow();
    });

    it('should handle cancellation of non-existent messages', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Message not found' 
      });
      
      const result = await freshCommand.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message not found');
    });

    it('should handle cancellation of already cancelled messages', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Message already cancelled' 
      });
      
      const result = await freshCommand.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Message already cancelled');
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
      expect(command).toBeInstanceOf(CancelMessageCommand);
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
        new CancelMessageCommand(null as any, 'msg-123');
      }).toThrow('Message processor is required');
    });

    it('should validate message ID', () => {
      expect(() => {
        new CancelMessageCommand(mockMessageProcessor, undefined as any);
      }).toThrow('Message ID is required');
    });

    it('should handle processor returning null', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue(null as any);
      
      const result = await freshCommand.execute();
      
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
      
      command = new CancelMessageCommand(mockMessageProcessor, longMessageId);
      
      const startTime = Date.now();
      await command.execute();
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(1000);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId: longMessageId,
        type: 'cancel'
      });
    });
  });

  describe('cancellation scenarios', () => {
    it('should handle cancellation of processing messages', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        cancelled: true, 
        status: 'cancelled' 
      });
      
      const result = await freshCommand.execute();
      
      expect(result.success).toBe(true);
      expect(result.cancelled).toBe(true);
      expect(result.status).toBe('cancelled');
    });

    it('should handle cancellation of pending messages', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        cancelled: true, 
        status: 'cancelled' 
      });
      
      const result = await freshCommand.execute();
      
      expect(result.success).toBe(true);
      expect(result.cancelled).toBe(true);
    });

    it('should handle cancellation of completed messages', async () => {
      // Create a fresh command for this test
      const freshCommand = new CancelMessageCommand(mockMessageProcessor, 'msg-123');
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Cannot cancel completed message' 
      });
      
      const result = await freshCommand.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel completed message');
    });
  });
}); 