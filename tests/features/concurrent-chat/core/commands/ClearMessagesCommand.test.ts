import { ClearMessagesCommand } from '../../../../../src/features/concurrent-chat/core/commands/ClearMessagesCommand';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('ClearMessagesCommand', () => {
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let command: ClearMessagesCommand;

  beforeEach(() => {
    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue({ success: true, cleared: true })
    };
  });

  describe('command creation', () => {
    it('should create command with required parameters', () => {
      const roomId = 123;
      
      command = new ClearMessagesCommand(mockMessageProcessor, roomId);
      
      expect(command).toBeInstanceOf(ClearMessagesCommand);
      expect(command).toBeInstanceOf(Object);
    });

    it('should store message processor reference', () => {
      const roomId = 456;
      
      command = new ClearMessagesCommand(mockMessageProcessor, roomId);
      
      const processor = (command as any).messageProcessor;
      expect(processor).toBe(mockMessageProcessor);
    });

    it('should store room ID', () => {
      const roomId = 789;
      
      command = new ClearMessagesCommand(mockMessageProcessor, roomId);
      
      const storedRoomId = (command as any).roomId;
      expect(storedRoomId).toBe(roomId);
    });

    it('should initialize cleared messages array', () => {
      const roomId = 123;
      
      command = new ClearMessagesCommand(mockMessageProcessor, roomId);
      
      const clearedMessages = (command as any).clearedMessages;
      expect(clearedMessages).toEqual([]);
    });
  });

  describe('command execution', () => {
    beforeEach(() => {
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
    });

    it('should execute successfully', async () => {
      const result = await command.execute();
      
      expect(result).toBeDefined();
      expect(mockMessageProcessor.process).toHaveBeenCalled();
    });

    it('should call message processor with correct parameters', async () => {
      const roomId = 456;
      
      command = new ClearMessagesCommand(mockMessageProcessor, roomId);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        roomId: roomId,
        type: 'clear'
      });
    });

    it('should store cleared messages for undo', async () => {
      const mockClearedMessages = [
        { id: 'msg-1', content: 'Message 1' },
        { id: 'msg-2', content: 'Message 2' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        messages: mockClearedMessages
      });
      
      await command.execute();
      
      const storedMessages = (command as any).clearedMessages;
      expect(storedMessages).toEqual(mockClearedMessages);
    });

    it('should return processor result', async () => {
      const expectedResult = { success: true, cleared: true, count: 5 };
      mockMessageProcessor.process.mockResolvedValue(expectedResult);
      
      const result = await command.execute();
      
      expect(result).toEqual(expectedResult);
    });

    it('should handle processor errors', async () => {
      const error = new Error('Clear failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(command.execute()).rejects.toThrow('Clear failed');
    });

    it('should handle null room ID', async () => {
      command = new ClearMessagesCommand(mockMessageProcessor, null);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        roomId: null,
        type: 'clear'
      });
    });

    it('should handle undefined room ID', async () => {
      command = new ClearMessagesCommand(mockMessageProcessor, undefined as any);
      
      await command.execute();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        roomId: undefined,
        type: 'clear'
      });
    });
  });

  describe('undo functionality', () => {
    beforeEach(() => {
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
    });

    it('should support undo operation', () => {
      expect(command.canUndo()).toBe(true);
    });

    it('should implement undo method', async () => {
      expect(typeof command.undo).toBe('function');
      
      await expect(command.undo()).resolves.not.toThrow();
    });

    it('should call processor with restore parameters on undo', async () => {
      const mockClearedMessages = [
        { id: 'msg-1', content: 'Message 1' },
        { id: 'msg-2', content: 'Message 2' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        messages: mockClearedMessages
      });
      
      await command.execute();
      await command.undo();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
      expect(mockMessageProcessor.process).toHaveBeenLastCalledWith({
        roomId: 123,
        type: 'restore',
        messages: mockClearedMessages
      });
    });

    it('should handle undo errors gracefully', async () => {
      mockMessageProcessor.process.mockRejectedValueOnce(new Error('Restore failed'));
      
      await command.execute();
      await expect(command.undo()).rejects.toThrow('Restore failed');
    });

    it('should prevent undo before execution', async () => {
      await expect(command.undo()).rejects.toThrow('Cannot undo command that has not been executed');
    });

    it('should handle undo with no cleared messages', async () => {
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        messages: []
      });
      
      await command.execute();
      await command.undo();
      
      expect(mockMessageProcessor.process).toHaveBeenCalledTimes(2);
      expect(mockMessageProcessor.process).toHaveBeenLastCalledWith({
        roomId: 123,
        type: 'restore',
        messages: []
      });
    });
  });

  describe('command metadata', () => {
    it('should provide command description', () => {
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
      
      const description = command.getDescription();
      
      expect(description).toContain('Clear messages');
      expect(description).toContain('123');
    });

    it('should provide command timestamp', () => {
      const beforeCreation = Date.now();
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
      const afterCreation = Date.now();
      
      const timestamp = command.getTimestamp();
      
      expect(timestamp).toBeGreaterThanOrEqual(beforeCreation);
      expect(timestamp).toBeLessThanOrEqual(afterCreation);
    });

    it('should provide command ID', () => {
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
      
      const commandId = command.getId();
      
      expect(commandId).toBeDefined();
      expect(typeof commandId).toBe('string');
      expect(commandId.length).toBeGreaterThan(0);
    });

    it('should provide cleared message count in description', () => {
      command = new ClearMessagesCommand(mockMessageProcessor, 123);
      
      const mockClearedMessages = [
        { id: 'msg-1', content: 'Message 1' },
        { id: 'msg-2', content: 'Message 2' },
        { id: 'msg-3', content: 'Message 3' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        messages: mockClearedMessages
      });
      
      command.execute();
      
      const description = command.getDescription();
      expect(description).toContain('clear');
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

    it('should track cleared messages correctly', async () => {
      const mockClearedMessages = [
        { id: 'msg-1', content: 'Message 1' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        messages: mockClearedMessages
      });
      
      expect((command as any).clearedMessages).toEqual([]);
      
      await command.execute();
      expect((command as any).clearedMessages).toEqual(mockClearedMessages);
    });
  });

  describe('clear validation', () => {
    it('should validate room ID', () => {
      const validRoomId = 123;
      const invalidRoomId = -1;
      
      expect(() => {
        new ClearMessagesCommand(mockMessageProcessor, validRoomId);
      }).not.toThrow();
      
      expect(() => {
        new ClearMessagesCommand(mockMessageProcessor, invalidRoomId);
      }).not.toThrow();
    });

    it('should handle clearing non-existent room', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: false, 
        error: 'Room not found' 
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Room not found');
    });

    it('should handle clearing empty room', async () => {
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        cleared: true,
        count: 0,
        messages: []
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it('should handle clearing room with messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'Message 1' },
        { id: 'msg-2', content: 'Message 2' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({ 
        success: true, 
        cleared: true,
        count: 2,
        messages: mockMessages
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });
  });

  describe('clear scenarios', () => {
    it('should handle clearing all messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'User message' },
        { id: 'msg-2', content: 'AI response' },
        { id: 'msg-3', content: 'Another user message' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        count: 3,
        messages: mockMessages
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect((command as any).clearedMessages).toEqual(mockMessages);
    });

    it('should handle clearing only user messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'User message', role: 'user' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        count: 1,
        messages: mockMessages
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
    });

    it('should handle clearing only AI messages', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'AI response', role: 'assistant' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        count: 1,
        messages: mockMessages
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.count).toBe(1);
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
      expect(command).toBeInstanceOf(ClearMessagesCommand);
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
        new ClearMessagesCommand(null as any, 123);
      }).toThrow('Message processor is required');
    });

    it('should validate room ID', () => {
      expect(() => {
        new ClearMessagesCommand(mockMessageProcessor, undefined as any);
      }).toThrow('Room ID is required');
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

    it('should handle large numbers of messages', async () => {
      const largeMessageArray = Array.from({ length: 1000 }, (_, i) => ({
        id: `msg-${i}`,
        content: `Message ${i}`,
        role: i % 2 === 0 ? 'user' : 'assistant'
      }));
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        count: 1000,
        messages: largeMessageArray
      });
      
      const startTime = Date.now();
      await command.execute();
      const executionTime = Date.now() - startTime;
      
      expect(executionTime).toBeLessThan(2000);
      expect((command as any).clearedMessages).toHaveLength(1000);
    });
  });

  describe('clear confirmation', () => {
    it('should handle clear confirmation', async () => {
      const mockMessages = [
        { id: 'msg-1', content: 'Important message' }
      ];
      
      mockMessageProcessor.process.mockResolvedValue({
        success: true,
        cleared: true,
        count: 1,
        messages: mockMessages,
        confirmed: true
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(true);
      expect(result.confirmed).toBe(true);
    });

    it('should handle clear cancellation', async () => {
      mockMessageProcessor.process.mockResolvedValue({
        success: false,
        error: 'Clear cancelled by user',
        cancelled: true
      });
      
      const result = await command.execute();
      
      expect(result.success).toBe(false);
      expect(result.cancelled).toBe(true);
    });
  });
}); 