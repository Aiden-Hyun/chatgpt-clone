import { ConcurrentMessageProcessor } from '../../../../../src/features/concurrent-chat/services/ConcurrentMessageProcessor';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { MESSAGE_EVENT_TYPES } from '../../../../../src/features/concurrent-chat/core/types/events';
import { ConcurrentMessage } from '../../../../../src/features/concurrent-chat/core/types';

describe('ConcurrentMessageProcessor', () => {
  let processor: ConcurrentMessageProcessor;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let mockAIService: any;
  let mockSession: any;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    processor = new ConcurrentMessageProcessor(eventBus, serviceContainer);

    // Mock AI service that can be configured to fail
    mockAIService = {
      sendMessage: jest.fn(),
    };

    // Mock session
    mockSession = {
      user: { id: 'test-user-id' },
      access_token: 'test-token',
    };

    // Register mocks in service container
    serviceContainer.register('aiService', mockAIService);
    serviceContainer.register('session', mockSession);
    serviceContainer.register('modelSelector', {
      getCurrentModel: () => 'gpt-3.5-turbo',
      getModelForRoom: () => Promise.resolve('gpt-3.5-turbo'),
    });

    // Spy on eventBus.publish to capture events
    eventSpy = jest.spyOn(eventBus, 'publish');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AI call rejection scenario', () => {
    it('should create failed assistant placeholder when AI call rejects, keeping user message non-failed', async () => {
      // Arrange: Configure AI service to reject
      const aiError = new Error('AI service unavailable');
      mockAIService.sendMessage.mockRejectedValueOnce(aiError);

      const userMessage: ConcurrentMessage = {
        id: 'user_msg_123',
        content: 'Hello, can you help me?',
        role: 'user',
        status: 'pending',
        timestamp: Date.now(),
        roomId: 42,
      };

      // Act: Process the user message (which should trigger AI call that fails)
      try {
        await processor.process(userMessage);
      } catch (error) {
        // Expected to throw, but we're interested in the events published
      }

      // Assert: Check published events
      const publishedEvents = eventSpy.mock.calls;
      
      // Should have MESSAGE_SENT events for both user message and assistant placeholder
      const sentEvents = publishedEvents.filter(call => call[0] === MESSAGE_EVENT_TYPES.MESSAGE_SENT);
      expect(sentEvents).toHaveLength(2);
      
      // First should be user message (completed)
      expect(sentEvents[0][1].message.role).toBe('user');
      expect(sentEvents[0][1].message.status).toBe('completed');
      expect(sentEvents[0][1].messageId).toBe('user_msg_123');
      
      // Second should be assistant placeholder (processing)
      expect(sentEvents[1][1].message.role).toBe('assistant');
      expect(sentEvents[1][1].message.status).toBe('processing');
      expect(sentEvents[1][1].messageId).toMatch(/^assistant_/);

      // Should have MESSAGE_FAILED for assistant placeholder (not user message)
      const failedEvents = publishedEvents.filter(call => call[0] === MESSAGE_EVENT_TYPES.MESSAGE_FAILED);
      expect(failedEvents).toHaveLength(1);
      expect(failedEvents[0][1].message.role).toBe('assistant');
      expect(failedEvents[0][1].message.status).toBe('failed');
      expect(failedEvents[0][1].messageId).not.toBe('user_msg_123'); // Different ID
      expect(failedEvents[0][1].messageId).toMatch(/^assistant_/); // Assistant ID pattern
      expect(failedEvents[0][1].error).toBe('AI service unavailable');
    });

    it('should complete non-user messages directly without AI processing', async () => {
      // Arrange: Non-user message (assistant message)
      const assistantMessage: ConcurrentMessage = {
        id: 'assistant_msg_456',
        content: 'I am an assistant message',
        role: 'assistant',
        status: 'pending',
        timestamp: Date.now(),
        roomId: 42,
      };

      // Act: Process the assistant message
      const result = await processor.process(assistantMessage);

      // Assert: Should return completed message
      expect(result.status).toBe('completed');
      expect(result.id).toBe('assistant_msg_456');

      // Check published events
      const publishedEvents = eventSpy.mock.calls;
      
      // Should have MESSAGE_SENT for the assistant message
      const sentEvents = publishedEvents.filter(call => call[0] === MESSAGE_EVENT_TYPES.MESSAGE_SENT);
      expect(sentEvents).toHaveLength(1);
      expect(sentEvents[0][1].messageId).toBe('assistant_msg_456');
      expect(sentEvents[0][1].message.status).toBe('completed');

      // Should NOT have MESSAGE_FAILED events for non-user messages in normal flow
      const failedEvents = publishedEvents.filter(call => call[0] === MESSAGE_EVENT_TYPES.MESSAGE_FAILED);
      expect(failedEvents).toHaveLength(0);
    });
  });

  describe('first turn persistence', () => {
    it('should persist first turn to correct room ID when activeRoomId is registered as numeric value', async () => {
      // Arrange: Configure AI service to succeed
      mockAIService.sendMessage.mockResolvedValueOnce({
        id: 'ai-response-123',
        content: 'Hello! How can I help you?',
        model: 'gpt-3.5-turbo',
        timestamp: Date.now(),
      });

      // Register a numeric activeRoomId (42) in service container
      const mockPersistenceService = {
        persistFirstTurn: jest.fn().mockResolvedValue(42),
      };
      serviceContainer.register('persistenceService', mockPersistenceService);
      serviceContainer.register('activeRoomId', 42); // Register as numeric value, not ref object

      const userMessage: ConcurrentMessage = {
        id: 'user_msg_123',
        content: 'Hello, this is the first message',
        role: 'user',
        status: 'pending',
        timestamp: Date.now(),
        // No roomId - this triggers first turn persistence logic
      };

      // Act: Process the user message
      const result = await processor.process(userMessage);

      // Assert: Should return completed message
      expect(result.status).toBe('completed');

      // Verify persistFirstTurn was called with correct room ID
      expect(mockPersistenceService.persistFirstTurn).toHaveBeenCalledWith(
        expect.objectContaining({
          numericRoomId: 42, // Should receive the numeric value, not an object
          userContent: 'Hello, this is the first message',
          assistantContent: expect.any(String), // Don't care about exact content, just that it's a string
        })
      );
    });

    it('should handle null activeRoomId and create new room', async () => {
      // Arrange: Configure AI service to succeed
      mockAIService.sendMessage.mockResolvedValueOnce({
        id: 'ai-response-456',
        content: 'Hi! I can help you with that.',
        model: 'gpt-3.5-turbo',
        timestamp: Date.now(),
      });

      // Register null activeRoomId
      const mockPersistenceService = {
        persistFirstTurn: jest.fn().mockResolvedValue(123),
      };
      serviceContainer.register('persistenceService', mockPersistenceService);
      serviceContainer.register('activeRoomId', null); // Register as null

      const userMessage: ConcurrentMessage = {
        id: 'user_msg_456',
        content: 'Hello, this should create a new room',
        role: 'user',
        status: 'pending',
        timestamp: Date.now(),
        // No roomId - this triggers first turn persistence logic
      };

      // Act: Process the user message
      const result = await processor.process(userMessage);

      // Assert: Should return completed message
      expect(result.status).toBe('completed');

      // Verify persistFirstTurn was called with null room ID (create new room path)
      expect(mockPersistenceService.persistFirstTurn).toHaveBeenCalledWith(
        expect.objectContaining({
          numericRoomId: null, // Should receive null, triggering room creation
          userContent: 'Hello, this should create a new room',
          assistantContent: expect.any(String), // Don't care about exact content, just that it's a string
        })
      );
    });
  });
});
