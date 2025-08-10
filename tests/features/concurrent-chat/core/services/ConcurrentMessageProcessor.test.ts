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
});
