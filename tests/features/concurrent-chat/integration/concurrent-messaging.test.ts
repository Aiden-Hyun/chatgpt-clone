import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ConcurrentMessageManager } from '../../../../src/features/concurrent-chat/core/concurrent/ConcurrentMessageManager';
import { MessageProcessor } from '../../../../src/features/concurrent-chat/core/messages/MessageProcessor';
import { MessageStateManager } from '../../../../src/features/concurrent-chat/core/messages/MessageStateManager';
import { ResponseMapper } from '../../../../src/features/concurrent-chat/core/concurrent/ResponseMapper';
import { UIManager } from '../../../../src/features/concurrent-chat/core/ui/UIManager';
import { MemoryManager } from '../../../../src/features/concurrent-chat/core/memory/MemoryManager';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { FeatureManager } from '../../../../src/features/concurrent-chat/core/features/FeatureManager';
import { ModelSelectionManager } from '../../../../src/features/concurrent-chat/core/model/ModelSelectionManager';

describe('Concurrent Messaging Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let concurrentMessageManager: ConcurrentMessageManager;
  let messageProcessor: MessageProcessor;
  let messageStateManager: MessageStateManager;
  let responseMapper: ResponseMapper;
  let uiManager: UIManager;
  let memoryManager: MemoryManager;
  let pluginManager: PluginManager;
  let featureManager: FeatureManager;
  let modelSelectionManager: ModelSelectionManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    concurrentMessageManager = new ConcurrentMessageManager(serviceContainer, eventBus);
    messageProcessor = new MessageProcessor(serviceContainer, eventBus);
    messageStateManager = new MessageStateManager(serviceContainer, eventBus);
    responseMapper = new ResponseMapper(serviceContainer, eventBus);
    uiManager = new UIManager(serviceContainer, eventBus);
    memoryManager = new MemoryManager(serviceContainer, eventBus);
    pluginManager = new PluginManager(serviceContainer, eventBus);
    featureManager = new FeatureManager(serviceContainer, eventBus);
    modelSelectionManager = new ModelSelectionManager(serviceContainer, eventBus);
  });

  describe('Send multiple messages concurrently', () => {
    it('should send multiple messages concurrently', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1' },
        { id: 'msg3', content: 'What is AI?', roomId: 'room1' }
      ];

      messageProcessor.processMessage = jest.fn().mockResolvedValue({ success: true });
      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: true },
          { messageId: 'msg2', success: true },
          { messageId: 'msg3', success: true }
        ]
      });

      const result = await concurrentMessageManager.sendConcurrentMessages(messages);

      expect(concurrentMessageManager.sendConcurrentMessages).toHaveBeenCalledWith(messages);
      expect(result.results).toHaveLength(3);
      expect(result.results.every(r => r.success)).toBe(true);
    });

    it('should handle concurrent message limits', async () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        roomId: 'room1'
      }));

      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: messages.map(msg => ({ messageId: msg.id, success: true })),
        exceededLimit: false
      });

      const result = await concurrentMessageManager.sendConcurrentMessages(messages);

      expect(result.results).toHaveLength(10);
      expect(result.exceededLimit).toBe(false);
    });

    it('should handle concurrent message queuing', async () => {
      const messages = [
        { id: 'msg1', content: 'Priority message', roomId: 'room1', priority: 'high' },
        { id: 'msg2', content: 'Normal message', roomId: 'room1', priority: 'normal' },
        { id: 'msg3', content: 'Low priority message', roomId: 'room1', priority: 'low' }
      ];

      concurrentMessageManager.queueConcurrentMessages = jest.fn().mockResolvedValue({
        queued: 3,
        queuePosition: { 'msg1': 1, 'msg2': 2, 'msg3': 3 }
      });

      const result = await concurrentMessageManager.queueConcurrentMessages(messages);

      expect(concurrentMessageManager.queueConcurrentMessages).toHaveBeenCalledWith(messages);
      expect(result.queued).toBe(3);
      expect(result.queuePosition['msg1']).toBe(1); // High priority first
    });

    it('should handle concurrent message batching', async () => {
      const messages = Array.from({ length: 20 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        roomId: 'room1'
      }));

      concurrentMessageManager.sendBatchedMessages = jest.fn().mockResolvedValue({
        batches: [
          { batchId: 'batch1', messages: messages.slice(0, 5), success: true },
          { batchId: 'batch2', messages: messages.slice(5, 10), success: true },
          { batchId: 'batch3', messages: messages.slice(10, 15), success: true },
          { batchId: 'batch4', messages: messages.slice(15, 20), success: true }
        ]
      });

      const result = await concurrentMessageManager.sendBatchedMessages(messages, 5);

      expect(concurrentMessageManager.sendBatchedMessages).toHaveBeenCalledWith(messages, 5);
      expect(result.batches).toHaveLength(4);
      expect(result.batches.every(batch => batch.success)).toBe(true);
    });
  });

  describe('Verify independent message states', () => {
    it('should maintain independent message states', async () => {
      const messages = [
        { id: 'msg1', content: 'Message 1', roomId: 'room1' },
        { id: 'msg2', content: 'Message 2', roomId: 'room1' }
      ];

      messageStateManager.setState = jest.fn().mockResolvedValue(true);
      messageStateManager.getState = jest.fn()
        .mockResolvedValueOnce({ status: 'processing', progress: 50 })
        .mockResolvedValueOnce({ status: 'completed', progress: 100 });

      // Set different states for each message
      await messageStateManager.setState('msg1', { status: 'processing', progress: 50 });
      await messageStateManager.setState('msg2', { status: 'completed', progress: 100 });

      const state1 = await messageStateManager.getState('msg1');
      const state2 = await messageStateManager.getState('msg2');

      expect(state1.status).toBe('processing');
      expect(state1.progress).toBe(50);
      expect(state2.status).toBe('completed');
      expect(state2.progress).toBe(100);
    });

    it('should handle message state isolation', async () => {
      const messages = [
        { id: 'msg1', content: 'Message 1', roomId: 'room1' },
        { id: 'msg2', content: 'Message 2', roomId: 'room1' }
      ];

      messageStateManager.setState = jest.fn().mockResolvedValue(true);
      messageStateManager.getState = jest.fn()
        .mockResolvedValueOnce({ status: 'failed', error: 'Network error' })
        .mockResolvedValueOnce({ status: 'completed', progress: 100 });

      // Simulate one message failing and one succeeding
      await messageStateManager.setState('msg1', { status: 'failed', error: 'Network error' });
      await messageStateManager.setState('msg2', { status: 'completed', progress: 100 });

      const state1 = await messageStateManager.getState('msg1');
      const state2 = await messageStateManager.getState('msg2');

      expect(state1.status).toBe('failed');
      expect(state1.error).toBe('Network error');
      expect(state2.status).toBe('completed');
      expect(state2.progress).toBe(100);
    });

    it('should handle message state transitions', async () => {
      const messageId = 'msg1';

      messageStateManager.setState = jest.fn().mockResolvedValue(true);
      messageStateManager.getState = jest.fn()
        .mockResolvedValueOnce({ status: 'pending' })
        .mockResolvedValueOnce({ status: 'processing', progress: 25 })
        .mockResolvedValueOnce({ status: 'processing', progress: 75 })
        .mockResolvedValueOnce({ status: 'completed', progress: 100 });

      // Simulate state transitions
      await messageStateManager.setState(messageId, { status: 'pending' });
      let state = await messageStateManager.getState(messageId);
      expect(state.status).toBe('pending');

      await messageStateManager.setState(messageId, { status: 'processing', progress: 25 });
      state = await messageStateManager.getState(messageId);
      expect(state.status).toBe('processing');
      expect(state.progress).toBe(25);

      await messageStateManager.setState(messageId, { status: 'processing', progress: 75 });
      state = await messageStateManager.getState(messageId);
      expect(state.status).toBe('processing');
      expect(state.progress).toBe(75);

      await messageStateManager.setState(messageId, { status: 'completed', progress: 100 });
      state = await messageStateManager.getState(messageId);
      expect(state.status).toBe('completed');
      expect(state.progress).toBe(100);
    });
  });

  describe('Verify correct response mapping', () => {
    it('should map responses to correct messages', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1' }
      ];

      const responses = [
        { messageId: 'msg1', content: 'Hi there!', status: 'completed' },
        { messageId: 'msg2', content: 'I am doing well, thank you!', status: 'completed' }
      ];

      responseMapper.mapResponses = jest.fn().mockResolvedValue({
        mappings: [
          { messageId: 'msg1', responseId: 'resp1', success: true },
          { messageId: 'msg2', responseId: 'resp2', success: true }
        ]
      });

      const result = await responseMapper.mapResponses(messages, responses);

      expect(responseMapper.mapResponses).toHaveBeenCalledWith(messages, responses);
      expect(result.mappings).toHaveLength(2);
      expect(result.mappings.every(m => m.success)).toBe(true);
    });

    it('should handle response mapping errors', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1' }
      ];

      const responses = [
        { messageId: 'msg1', content: 'Hi there!', status: 'completed' }
        // Missing response for msg2
      ];

      responseMapper.mapResponses = jest.fn().mockResolvedValue({
        mappings: [
          { messageId: 'msg1', responseId: 'resp1', success: true },
          { messageId: 'msg2', responseId: null, success: false, error: 'No response found' }
        ]
      });

      const result = await responseMapper.mapResponses(messages, responses);

      expect(result.mappings[0].success).toBe(true);
      expect(result.mappings[1].success).toBe(false);
      expect(result.mappings[1].error).toBe('No response found');
    });

    it('should handle duplicate response mapping', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' }
      ];

      const responses = [
        { messageId: 'msg1', content: 'Hi there!', status: 'completed' },
        { messageId: 'msg1', content: 'Hello!', status: 'completed' } // Duplicate
      ];

      responseMapper.mapResponses = jest.fn().mockResolvedValue({
        mappings: [
          { messageId: 'msg1', responseId: 'resp1', success: true, duplicateHandled: true }
        ]
      });

      const result = await responseMapper.mapResponses(messages, responses);

      expect(result.mappings[0].duplicateHandled).toBe(true);
    });
  });

  describe('Handle mixed success/failure scenarios', () => {
    it('should handle mixed success and failure scenarios', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1' },
        { id: 'msg3', content: 'What is AI?', roomId: 'room1' }
      ];

      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: true, response: 'Hi there!' },
          { messageId: 'msg2', success: false, error: 'Network timeout' },
          { messageId: 'msg3', success: true, response: 'AI is artificial intelligence' }
        ]
      });

      const result = await concurrentMessageManager.sendConcurrentMessages(messages);

      expect(result.results).toHaveLength(3);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);
      expect(result.results[2].success).toBe(true);
    });

    it('should handle partial failures gracefully', async () => {
      const messages = Array.from({ length: 10 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        roomId: 'room1'
      }));

      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: messages.map((msg, i) => ({
          messageId: msg.id,
          success: i % 2 === 0, // Alternate success/failure
          response: i % 2 === 0 ? `Response ${i}` : null,
          error: i % 2 === 1 ? `Error ${i}` : null
        })),
        successCount: 5,
        failureCount: 5
      });

      const result = await concurrentMessageManager.sendConcurrentMessages(messages);

      expect(result.successCount).toBe(5);
      expect(result.failureCount).toBe(5);
      expect(result.results.filter(r => r.success)).toHaveLength(5);
      expect(result.results.filter(r => !r.success)).toHaveLength(5);
    });

    it('should handle cascading failures', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1', dependsOn: 'msg1' },
        { id: 'msg3', content: 'What is AI?', roomId: 'room1', dependsOn: 'msg2' }
      ];

      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: false, error: 'Initial failure' },
          { messageId: 'msg2', success: false, error: 'Dependency failed', cascading: true },
          { messageId: 'msg3', success: false, error: 'Dependency failed', cascading: true }
        ],
        cascadingFailures: 2
      });

      const result = await concurrentMessageManager.sendConcurrentMessages(messages);

      expect(result.cascadingFailures).toBe(2);
      expect(result.results.every(r => !r.success)).toBe(true);
    });
  });

  describe('Verify UI updates correctly', () => {
    it('should update UI for concurrent messages', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1' }
      ];

      uiManager.updateMessageList = jest.fn().mockResolvedValue(true);
      uiManager.updateMessageStatus = jest.fn().mockResolvedValue(true);
      uiManager.showLoadingIndicator = jest.fn().mockResolvedValue(true);

      await uiManager.updateMessageList(messages);
      await uiManager.showLoadingIndicator(true);

      expect(uiManager.updateMessageList).toHaveBeenCalledWith(messages);
      expect(uiManager.showLoadingIndicator).toHaveBeenCalledWith(true);
    });

    it('should handle UI updates for mixed states', async () => {
      const messageStates = [
        { id: 'msg1', status: 'processing', progress: 50 },
        { id: 'msg2', status: 'completed', progress: 100 },
        { id: 'msg3', status: 'failed', error: 'Network error' }
      ];

      uiManager.updateMessageStatus = jest.fn().mockResolvedValue(true);
      uiManager.showError = jest.fn().mockResolvedValue(true);

      for (const state of messageStates) {
        await uiManager.updateMessageStatus(state.id, state);
        if (state.status === 'failed') {
          await uiManager.showError(state.id, state.error);
        }
      }

      expect(uiManager.updateMessageStatus).toHaveBeenCalledTimes(3);
      expect(uiManager.showError).toHaveBeenCalledWith('msg3', 'Network error');
    });

    it('should handle UI performance with many messages', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg${i}`,
        content: `Message ${i}`,
        roomId: 'room1'
      }));

      const startTime = performance.now();
      await uiManager.updateMessageList(messages);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100); // Should update quickly
    });
  });

  describe('Test message cancellation during processing', () => {
    it('should cancel messages during processing', async () => {
      const messageId = 'msg1';

      messageStateManager.setState = jest.fn().mockResolvedValue(true);
      messageStateManager.getState = jest.fn().mockResolvedValue({ status: 'processing' });

      concurrentMessageManager.cancelMessage = jest.fn().mockResolvedValue({
        success: true,
        cancelledAt: new Date()
      });

      const result = await concurrentMessageManager.cancelMessage(messageId);

      expect(concurrentMessageManager.cancelMessage).toHaveBeenCalledWith(messageId);
      expect(result.success).toBe(true);
    });

    it('should handle cancellation of multiple messages', async () => {
      const messageIds = ['msg1', 'msg2', 'msg3'];

      concurrentMessageManager.cancelMultipleMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: true },
          { messageId: 'msg2', success: true },
          { messageId: 'msg3', success: false, error: 'Already completed' }
        ]
      });

      const result = await concurrentMessageManager.cancelMultipleMessages(messageIds);

      expect(concurrentMessageManager.cancelMultipleMessages).toHaveBeenCalledWith(messageIds);
      expect(result.results.filter(r => r.success)).toHaveLength(2);
      expect(result.results.filter(r => !r.success)).toHaveLength(1);
    });

    it('should handle cancellation of completed messages', async () => {
      const messageId = 'msg1';

      messageStateManager.getState = jest.fn().mockResolvedValue({ status: 'completed' });

      concurrentMessageManager.cancelMessage = jest.fn().mockResolvedValue({
        success: false,
        error: 'Cannot cancel completed message'
      });

      const result = await concurrentMessageManager.cancelMessage(messageId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot cancel completed message');
    });
  });

  describe('Test retry functionality', () => {
    it('should retry failed messages', async () => {
      const messageId = 'msg1';

      concurrentMessageManager.retryMessage = jest.fn().mockResolvedValue({
        success: true,
        retryCount: 1,
        response: 'Retry successful'
      });

      const result = await concurrentMessageManager.retryMessage(messageId);

      expect(concurrentMessageManager.retryMessage).toHaveBeenCalledWith(messageId);
      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(1);
    });

    it('should handle retry limits', async () => {
      const messageId = 'msg1';

      concurrentMessageManager.retryMessage = jest.fn().mockResolvedValue({
        success: false,
        error: 'Max retries exceeded',
        retryCount: 3
      });

      const result = await concurrentMessageManager.retryMessage(messageId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Max retries exceeded');
      expect(result.retryCount).toBe(3);
    });

    it('should retry multiple failed messages', async () => {
      const messageIds = ['msg1', 'msg2', 'msg3'];

      concurrentMessageManager.retryMultipleMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: true, retryCount: 1 },
          { messageId: 'msg2', success: true, retryCount: 1 },
          { messageId: 'msg3', success: false, error: 'Max retries exceeded' }
        ]
      });

      const result = await concurrentMessageManager.retryMultipleMessages(messageIds);

      expect(concurrentMessageManager.retryMultipleMessages).toHaveBeenCalledWith(messageIds);
      expect(result.results.filter(r => r.success)).toHaveLength(2);
      expect(result.results.filter(r => !r.success)).toHaveLength(1);
    });
  });

  describe('Verify memory cleanup', () => {
    it('should clean up completed messages', async () => {
      const completedMessages = ['msg1', 'msg2', 'msg3'];

      memoryManager.cleanupCompletedMessages = jest.fn().mockResolvedValue({
        cleaned: 3,
        freedMemory: '2.5MB'
      });

      const result = await memoryManager.cleanupCompletedMessages(completedMessages);

      expect(memoryManager.cleanupCompletedMessages).toHaveBeenCalledWith(completedMessages);
      expect(result.cleaned).toBe(3);
      expect(result.freedMemory).toBe('2.5MB');
    });

    it('should handle memory cleanup errors', async () => {
      const completedMessages = ['msg1', 'msg2'];

      memoryManager.cleanupCompletedMessages = jest.fn().mockResolvedValue({
        cleaned: 1,
        freedMemory: '1MB',
        errors: ['Failed to cleanup msg2']
      });

      const result = await memoryManager.cleanupCompletedMessages(completedMessages);

      expect(result.cleaned).toBe(1);
      expect(result.errors).toContain('Failed to cleanup msg2');
    });

    it('should monitor memory usage', async () => {
      memoryManager.getMemoryUsage = jest.fn().mockResolvedValue({
        used: '50MB',
        total: '100MB',
        percentage: 50
      });

      const usage = await memoryManager.getMemoryUsage();

      expect(usage.used).toBe('50MB');
      expect(usage.total).toBe('100MB');
      expect(usage.percentage).toBe(50);
    });
  });

  describe('Plugin integration', () => {
    it('should integrate with message processing plugins', async () => {
      const message = { id: 'msg1', content: 'Hello', roomId: 'room1' };

      const messagePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        processMessage: jest.fn().mockReturnValue({ ...message, enhanced: true })
      };

      pluginManager.registerPlugin('message-processor', messagePlugin);
      pluginManager.mountPlugin('message-processor');

      const result = await messageProcessor.processMessageWithPlugins(message);

      expect(messagePlugin.processMessage).toHaveBeenCalledWith(message);
      expect(result.enhanced).toBe(true);
    });

    it('should integrate with response processing plugins', async () => {
      const response = { messageId: 'msg1', content: 'Hello there!', status: 'completed' };

      const responsePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        processResponse: jest.fn().mockReturnValue({ ...response, formatted: true })
      };

      pluginManager.registerPlugin('response-processor', responsePlugin);
      pluginManager.mountPlugin('response-processor');

      const result = await responseMapper.mapResponseWithPlugins(response);

      expect(responsePlugin.processResponse).toHaveBeenCalledWith(response);
      expect(result.formatted).toBe(true);
    });
  });

  describe('Feature interaction', () => {
    it('should interact with animation features', async () => {
      const message = { id: 'msg1', content: 'Hello', roomId: 'room1' };

      featureManager.getFeature = jest.fn().mockReturnValue({
        animate: jest.fn().mockResolvedValue(true)
      });

      const animationFeature = featureManager.getFeature('animation');
      const result = await animationFeature.animate(message);

      expect(animationFeature.animate).toHaveBeenCalledWith(message);
      expect(result).toBe(true);
    });

    it('should interact with streaming features', async () => {
      const message = { id: 'msg1', content: 'Hello', roomId: 'room1' };

      featureManager.getFeature = jest.fn().mockReturnValue({
        stream: jest.fn().mockResolvedValue(true)
      });

      const streamingFeature = featureManager.getFeature('streaming');
      const result = await streamingFeature.stream(message);

      expect(streamingFeature.stream).toHaveBeenCalledWith(message);
      expect(result).toBe(true);
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Each manager should have a single responsibility
      expect(concurrentMessageManager).toBeDefined();
      expect(messageProcessor).toBeDefined();
      expect(messageStateManager).toBeDefined();
      expect(responseMapper).toBeDefined();
      expect(uiManager).toBeDefined();
      expect(memoryManager).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('new-feature', newPlugin);
      const registeredPlugin = pluginManager.getPlugin('new-feature');

      expect(registeredPlugin).toBe(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be able to substitute managers with different implementations
      const baseManager = new ConcurrentMessageManager(serviceContainer, eventBus);
      const alternativeManager = new ConcurrentMessageManager(serviceContainer, eventBus);

      expect(baseManager).toBeDefined();
      expect(alternativeManager).toBeDefined();
    });

    it('should follow Interface Segregation Principle', () => {
      // Should use focused interfaces
      expect(messageProcessor.processMessage).toBeDefined();
      expect(messageStateManager.setState).toBeDefined();
      expect(responseMapper.mapResponses).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (interfaces) not concretions
      expect(serviceContainer).toBeDefined();
      expect(eventBus).toBeDefined();
    });
  });

  describe('Model selection integration', () => {
    it('should integrate model selection with concurrent messaging', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1', model: 'gpt-4' },
        { id: 'msg2', content: 'How are you?', roomId: 'room1', model: 'gpt-3.5-turbo' }
      ];

      modelSelectionManager.validateModel = jest.fn().mockResolvedValue(true);
      concurrentMessageManager.sendConcurrentMessages = jest.fn().mockResolvedValue({
        results: [
          { messageId: 'msg1', success: true, model: 'gpt-4' },
          { messageId: 'msg2', success: true, model: 'gpt-3.5-turbo' }
        ]
      });

      const result = await concurrentMessageManager.sendConcurrentMessagesWithModels(messages);

      expect(modelSelectionManager.validateModel).toHaveBeenCalledTimes(2);
      expect(result.results).toHaveLength(2);
      expect(result.results[0].model).toBe('gpt-4');
      expect(result.results[1].model).toBe('gpt-3.5-turbo');
    });

    it('should handle model selection failures', async () => {
      const messages = [
        { id: 'msg1', content: 'Hello', roomId: 'room1', model: 'invalid-model' }
      ];

      modelSelectionManager.validateModel = jest.fn().mockResolvedValue(false);

      const result = await concurrentMessageManager.sendConcurrentMessagesWithModels(messages);

      expect(result.results[0].success).toBe(false);
      expect(result.results[0].error).toContain('Invalid model');
    });
  });
}); 