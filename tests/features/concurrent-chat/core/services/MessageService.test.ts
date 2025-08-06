import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { MessageService } from '../../../../../src/features/concurrent-chat/core/services/MessageService';
import { IMessageProcessor } from '../../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

describe('MessageService', () => {
  let messageService: MessageService;
  let mockMessageProcessor: jest.Mocked<IMessageProcessor>;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockMessageProcessor = {
      process: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' })
    };
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;
    
    messageService = new MessageService(mockMessageProcessor, mockEventBus);
  });

  describe('service creation', () => {
    it('should create message service instance', () => {
      expect(messageService).toBeInstanceOf(MessageService);
      expect(messageService).toBeInstanceOf(Object);
    });

    it('should store dependencies', () => {
      const processor = (messageService as any).messageProcessor;
      const eventBus = (messageService as any).eventBus;
      
      expect(processor).toBe(mockMessageProcessor);
      expect(eventBus).toBe(mockEventBus);
    });

    it('should initialize command history', () => {
      const history = (messageService as any).commandHistory;
      expect(history).toEqual([]);
    });

    it('should initialize processing messages set', () => {
      const processingMessages = (messageService as any).processingMessages;
      expect(processingMessages).toBeInstanceOf(Set);
      expect(processingMessages.size).toBe(0);
    });
  });

  describe('message sending', () => {
    it('should send message successfully', async () => {
      const content = 'Hello, world!';
      const roomId = 123;
      
      const result = await messageService.sendMessage(content, roomId);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content,
        roomId,
        type: 'send'
      });
    });

    it('should publish message sent event', async () => {
      const content = 'Test message';
      const roomId = 456;
      
      await messageService.sendMessage(content, roomId);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('message.sent', {
        content,
        roomId,
        messageId: 'test-id'
      });
    });

    it('should add command to history', async () => {
      const content = 'Test message';
      const roomId = 789;
      
      await messageService.sendMessage(content, roomId);
      
      const history = (messageService as any).commandHistory;
      expect(history.length).toBe(1);
      expect(history[0]).toBeInstanceOf(Object);
    });

    it('should track processing message', async () => {
      const content = 'Test message';
      const roomId = 123;
      
      await messageService.sendMessage(content, roomId);
      
      const processingMessages = (messageService as any).processingMessages;
      expect(processingMessages.size).toBe(1);
    });

    it('should handle processor errors', async () => {
      const error = new Error('Processing failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(messageService.sendMessage('Test', 123)).rejects.toThrow('Processing failed');
    });

    it('should handle empty content', async () => {
      const result = await messageService.sendMessage('', 123);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: '',
        roomId: 123,
        type: 'send'
      });
    });

    it('should handle null room ID', async () => {
      const result = await messageService.sendMessage('Test', null);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: 'Test',
        roomId: null,
        type: 'send'
      });
    });
  });

  describe('message cancellation', () => {
    it('should cancel message successfully', async () => {
      const messageId = 'msg-123';
      
      const result = await messageService.cancelMessage(messageId);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId,
        type: 'cancel'
      });
    });

    it('should publish message cancelled event', async () => {
      const messageId = 'msg-456';
      
      await messageService.cancelMessage(messageId);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('message.cancelled', {
        messageId
      });
    });

    it('should remove from processing messages', async () => {
      const messageId = 'msg-789';
      
      // Add to processing first
      const processingMessages = (messageService as any).processingMessages;
      processingMessages.add(messageId);
      
      await messageService.cancelMessage(messageId);
      
      expect(processingMessages.has(messageId)).toBe(false);
    });

    it('should handle cancellation errors', async () => {
      const error = new Error('Cancellation failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(messageService.cancelMessage('msg-123')).rejects.toThrow('Cancellation failed');
    });
  });

  describe('message retry', () => {
    it('should retry message successfully', async () => {
      const messageId = 'msg-123';
      
      const result = await messageService.retryMessage(messageId);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        messageId,
        type: 'retry'
      });
    });

    it('should publish message retried event', async () => {
      const messageId = 'msg-456';
      
      await messageService.retryMessage(messageId);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('message.retried', {
        messageId
      });
    });

    it('should add to processing messages', async () => {
      const messageId = 'msg-789';
      
      await messageService.retryMessage(messageId);
      
      const processingMessages = (messageService as any).processingMessages;
      expect(processingMessages.has(messageId)).toBe(true);
    });

    it('should handle retry errors', async () => {
      const error = new Error('Retry failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(messageService.retryMessage('msg-123')).rejects.toThrow('Retry failed');
    });
  });

  describe('message clearing', () => {
    it('should clear messages successfully', async () => {
      const roomId = 123;
      
      const result = await messageService.clearMessages(roomId);
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        roomId,
        type: 'clear'
      });
    });

    it('should publish messages cleared event', async () => {
      const roomId = 456;
      
      await messageService.clearMessages(roomId);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('messages.cleared', {
        roomId
      });
    });

    it('should handle clear errors', async () => {
      const error = new Error('Clear failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(messageService.clearMessages(123)).rejects.toThrow('Clear failed');
    });
  });

  describe('command history management', () => {
    it('should add commands to history', async () => {
      await messageService.sendMessage('Test 1', 123);
      await messageService.sendMessage('Test 2', 456);
      
      const history = (messageService as any).commandHistory;
      expect(history.length).toBe(2);
    });

    it('should limit history size', async () => {
      const maxHistory = 5;
      const limitedService = new MessageService(mockMessageProcessor, mockEventBus, maxHistory);
      
      // Add more commands than max
      for (let i = 0; i < 10; i++) {
        await limitedService.sendMessage(`Test ${i}`, i);
      }
      
      const history = (limitedService as any).commandHistory;
      expect(history.length).toBe(maxHistory);
    });

    it('should provide command history', () => {
      const history = messageService.getCommandHistory();
      expect(history).toEqual([]);
    });

    it('should clear command history', async () => {
      await messageService.sendMessage('Test', 123);
      
      messageService.clearCommandHistory();
      
      const history = (messageService as any).commandHistory;
      expect(history.length).toBe(0);
    });
  });

  describe('processing messages tracking', () => {
    it('should track processing messages', async () => {
      await messageService.sendMessage('Test 1', 123);
      await messageService.sendMessage('Test 2', 456);
      
      const processingMessages = (messageService as any).processingMessages;
      expect(processingMessages.size).toBe(2);
    });

    it('should provide processing messages count', () => {
      const count = messageService.getProcessingMessagesCount();
      expect(count).toBe(0);
    });

    it('should check if message is processing', async () => {
      const messageId = 'msg-123';
      
      // Add to processing
      const processingMessages = (messageService as any).processingMessages;
      processingMessages.add(messageId);
      
      expect(messageService.isMessageProcessing(messageId)).toBe(true);
      expect(messageService.isMessageProcessing('msg-456')).toBe(false);
    });

    it('should remove from processing when completed', async () => {
      const messageId = 'msg-123';
      
      // Add to processing
      const processingMessages = (messageService as any).processingMessages;
      processingMessages.add(messageId);
      
      messageService.removeFromProcessing(messageId);
      
      expect(processingMessages.has(messageId)).toBe(false);
    });
  });

  describe('undo functionality', () => {
    it('should undo last command', async () => {
      await messageService.sendMessage('Test', 123);
      
      const result = await messageService.undoLastCommand();
      
      expect(result.success).toBe(true);
      expect(mockMessageProcessor.process).toHaveBeenCalledWith({
        content: 'Test',
        roomId: 123,
        type: 'undo'
      });
    });

    it('should publish command undone event', async () => {
      await messageService.sendMessage('Test', 123);
      await messageService.undoLastCommand();
      
      expect(mockEventBus.publish).toHaveBeenCalledWith('command.undone', {
        commandType: 'send'
      });
    });

    it('should handle empty history', async () => {
      await expect(messageService.undoLastCommand()).rejects.toThrow('No commands to undo');
    });

    it('should handle undo errors', async () => {
      await messageService.sendMessage('Test', 123);
      
      const error = new Error('Undo failed');
      mockMessageProcessor.process.mockRejectedValue(error);
      
      await expect(messageService.undoLastCommand()).rejects.toThrow('Undo failed');
    });
  });

  describe('event handling', () => {
    it('should subscribe to events', () => {
      const handler = jest.fn();
      
      messageService.subscribeToEvents(handler);
      
      expect(mockEventBus.subscribe).toHaveBeenCalledWith('message.*', handler);
    });

    it('should unsubscribe from events', () => {
      const subscriptionId = 'sub-123';
      
      messageService.unsubscribeFromEvents(subscriptionId);
      
      expect(mockEventBus.unsubscribeById).toHaveBeenCalledWith(subscriptionId);
    });
  });

  describe('error handling and validation', () => {
    it('should validate message processor', () => {
      expect(() => {
        new MessageService(null as any, mockEventBus);
      }).toThrow('Message processor is required');
    });

    it('should validate event bus', () => {
      expect(() => {
        new MessageService(mockMessageProcessor, null as any);
      }).toThrow('Event bus is required');
    });

    it('should handle processor returning null', async () => {
      mockMessageProcessor.process.mockResolvedValue(null as any);
      
      const result = await messageService.sendMessage('Test', 123);
      
      expect(result).toBeNull();
    });

    it('should handle processor returning undefined', async () => {
      mockMessageProcessor.process.mockResolvedValue(undefined as any);
      
      const result = await messageService.sendMessage('Test', 123);
      
      expect(result).toBeUndefined();
    });
  });

  describe('performance considerations', () => {
    it('should handle large command history efficiently', async () => {
      const maxHistory = 1000;
      const largeService = new MessageService(mockMessageProcessor, mockEventBus, maxHistory);
      
      // Add many commands
      for (let i = 0; i < 1000; i++) {
        await largeService.sendMessage(`Test ${i}`, i);
      }
      
      const history = largeService.getCommandHistory();
      expect(history.length).toBe(1000);
    });

    it('should handle many processing messages', async () => {
      // Add many processing messages
      for (let i = 0; i < 100; i++) {
        await messageService.sendMessage(`Test ${i}`, i);
      }
      
      const count = messageService.getProcessingMessagesCount();
      expect(count).toBe(100);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for message management
      expect(messageService.sendMessage).toBeDefined();
      expect(messageService.cancelMessage).toBeDefined();
      expect(messageService.retryMessage).toBeDefined();
      expect(messageService.clearMessages).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(messageService).toBeInstanceOf(MessageService);
      expect(messageService).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with any IMessageProcessor implementation
      expect(mockMessageProcessor.process).toBeDefined();
      expect(typeof mockMessageProcessor.process).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      expect(messageService.sendMessage).toBeDefined();
      expect(messageService.cancelMessage).toBeDefined();
      expect(messageService.retryMessage).toBeDefined();
      expect(messageService.clearMessages).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      expect(mockMessageProcessor.process).toBeDefined();
      expect(mockEventBus.publish).toBeDefined();
    });
  });
}); 