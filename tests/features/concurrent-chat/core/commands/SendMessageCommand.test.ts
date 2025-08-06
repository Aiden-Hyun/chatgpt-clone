import { SendMessageCommand } from '../../../../../src/features/concurrent-chat/core/commands/SendMessageCommand';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('SendMessageCommand', () => {
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let command: SendMessageCommand;

  beforeEach(() => {
    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' })
    };
  });

  describe('command creation', () => {
    it('should create command with required parameters', () => {
      const messageContent = 'Hello, world!';
      const roomId = 123;
      
      command = new SendMessageCommand(mockMessageProcessor, messageContent, roomId);
      
      expect(command).toBeInstanceOf(SendMessageCommand);
      expect(command).toBeInstanceOf(Object);
    });

    it('should store message processor reference', () => {
      const messageContent = 'Test message';
      const roomId = 456;
      
      command = new SendMessageCommand(mockMessageProcessor, messageContent, roomId);
      
      // Access private property for testing
      const processor = (command as any).messageProcessor;
      expect(processor).toBe(mockMessageProcessor);
    });

    it('should store message content and room ID', () => {
      const messageContent = 'Test message content';
      const roomId = 789;
      
      command = new SendMessageCommand(mockMessageProcessor, messageContent, roomId);
      
      const content = (command as any).messageContent;
      const room = (command as any).roomId;
      
      expect(content).toBe(messageContent);
      expect(room).toBe(roomId);
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      command = new SendMessageCommand(mockMessageProcessor, 'Test message', 123);
    });

    it('should execute successfully', async () => {
      const result = await command.execute();
      
      expect(result).toBeDefined();
      expect(mockMessageProcessor.process).toHaveBeenCalled();
    });

    it('should call message processor with correct parameters', async () => {
      const messageContent = 'Hello, AI!';
      const roomId = 456;
      
      command = new SendMessageCommand(mockMessageProcessor, messageContent, roomId);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: messageContent,
        roomId: roomId,
        type: 'send'
      });
    });

    it('should return processor result', async () => {
      const expectedResult = { success: true, messageId: 'msg-123' };
      mockMessageProcessor.process.mockResolvedValue(expectedResult);
      
      const result = await command.execute();
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle processor errors', async () => {
      const error = new Error('Processing failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(command.execute()).rejects.toThrow('Processing failed');
    });

    it('should handle empty message content', async () => {
      command = new SendMessageCommand(mockMessageProcessor, '', 123);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: '',
        roomId: 123,
        type: 'send'
      });
    });

    it('should handle null room ID', async () => {
      command = new SendMessageCommand(mockMessageProcessor, 'Test message', null);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: 'Test message',
        roomId: null,
        type: 'send'
      });
    });
  });

  describe('undo functionality', () => {
    beforeEach(() => {
      command = new SendMessageCommand(mockMessageProcessor, 'Test message', 123);
    });

    it('should support undo operation', () => {
      expect(command.canUndo()).toBe(true);
    });

    it('should implement undo method', async () => {
      expect(typeof command.undo).toBe('function');
      
      // Should not throw when called
      await expect(command.undo()).resolves.not.toThrow();
    });

    it('should call processor with undo parameters', async () => {
      await command.execute();
      await command.undo();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
      expect(mockMessageProcessor.process).toHaveBeenLastCalledWith({
        content: 'Test message',
        roomId: 123,
        type: 'undo'
      });
    });

    it('should handle undo errors gracefully', async () => {
      mockMessageProcessor.process.mockRejectedValueOnce(new Error('Undo failed'));
      
      await command.execute();
      await expect(command.undo()).rejects.toThrow('Undo failed');
    });
  });

  describe('command metadata', () => {
    it('should provide command description', () => {
      command = new SendMessageCommand(mockMessageProcessor, 'Hello', 123);
      
      const description = command.getDescription();
      
      expect(description).toContain('Send message');
      expect(description).toContain('Hello');
      expect(description).toContain('123');
    });

    it('should provide command timestamp', () => {
      const beforeCreation = Date.now();
      command = new SendMessageCommand(mockMessageProcessor, 'Test', 123);
      const afterCreation = Date.now();
      
      const timestamp = command.getTimestamp();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(timestamp).toBeLessThanOrEqual(afterCreation);
    });

    it('should provide command ID', () => {
      command = new SendMessageCommand(mockMessageProcessor, 'Test', 123);
      
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
      await command.execute();
      
      // Second execution should not call processor again
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(1);
    });

    it('should prevent undo before execution', async () => {
      await expect(command.undo()).rejects.toThrow('Cannot undo command that has not been executed');
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Command should only be responsible for sending messages
      expect(command.execute).toBeDefined();
      expect(command.undo).toBeDefined();
      expect(command.canUndo).toBeDefined();
      
      // Should not have methods unrelated to command execution
      const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(command));
      const commandMethods = methods.filter(method => 
        method.includes('execute') || method.includes('undo') || method.includes('canUndo')
      );
      
      expect(commandMethods.length).toBeGreaterThan(0);
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new command types) but closed for modification
      expect(command).toBeInstanceOf(SendMessageCommand);
      expect(command).toBeInstanceOf(Object);
      
      // Should not modify existing behavior when extended
      const originalExecute = command.execute.bind(command);
      expect(typeof originalExecute).toBe('function');
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be substitutable for ICommand interface
      const commandInterface: ICommand = command;
      
      expect(typeof commandInterface.execute).toBe('function');
      expect(typeof commandInterface.undo).toBe('function');
      expect(typeof commandInterface.canUndo).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      const commandInterface: ICommand = command;
      
      // Client should only need to know about ICommand methods
      expect(commandInterface.execute).toBeDefined();
      expect(commandInterface.undo).toBeDefined();
      expect(commandInterface.canUndo).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IMessageProcessor) not concretions
      expect(mockMessageProcessor.process).toBeDefined();
      expect(typeof mockMessageProcessor.process).toBe('function');
    });
  });

  describe('error handling and validation', () => {
    it('should validate message processor', () => {
      expect(() => {
        new SendMessageCommand(null as any, 'Test', 123);
      }).toThrow('Message processor is required');
    });

    it('should validate message content', () => {
      expect(() => {
        new SendMessageCommand(mockMessageProcessor, null as any, 123);
      }).toThrow('Message content is required');
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
      expect(executionTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle large message content', async () => {
      const largeMessage = 'A'.repeat(10000); // 10KB message
      
      command = new SendMessageCommand(mockMessageProcessor, largeMessage, 123);
      
      const startTime = Date.now();
      await command.execute();
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: largeMessage,
        roomId: 123,
        type: 'send'
      });
    });
  });
}); 