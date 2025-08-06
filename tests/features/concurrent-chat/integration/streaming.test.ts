import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { StreamingManager } from '../../../../src/features/concurrent-chat/core/streaming/StreamingManager';
import { StreamProcessor } from '../../../../src/features/concurrent-chat/core/streaming/StreamProcessor';
import { StreamBuffer } from '../../../../src/features/concurrent-chat/core/streaming/StreamBuffer';
import { StreamQualityManager } from '../../../../src/features/concurrent-chat/core/streaming/StreamQualityManager';
import { StreamErrorHandler } from '../../../../src/features/concurrent-chat/core/streaming/StreamErrorHandler';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { StrategyManager } from '../../../../src/features/concurrent-chat/core/strategies/StrategyManager';

describe('Streaming Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let streamingManager: StreamingManager;
  let streamProcessor: StreamProcessor;
  let streamBuffer: StreamBuffer;
  let streamQualityManager: StreamQualityManager;
  let streamErrorHandler: StreamErrorHandler;
  let pluginManager: PluginManager;
  let strategyManager: StrategyManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    streamingManager = new StreamingManager(serviceContainer, eventBus);
    streamProcessor = new StreamProcessor(serviceContainer, eventBus);
    streamBuffer = new StreamBuffer(serviceContainer, eventBus);
    streamQualityManager = new StreamQualityManager(serviceContainer, eventBus);
    streamErrorHandler = new StreamErrorHandler(serviceContainer, eventBus);
    pluginManager = new PluginManager(serviceContainer, eventBus);
    strategyManager = new StrategyManager(serviceContainer, eventBus);
  });

  describe('Stream content in real-time', () => {
    it('should stream content in real-time', async () => {
      const messageId = 'msg1';
      const streamData = [
        { content: 'Hello', timestamp: Date.now() },
        { content: ' World', timestamp: Date.now() + 100 },
        { content: '!', timestamp: Date.now() + 200 }
      ];

      streamingManager.startStream = jest.fn().mockResolvedValue({ streamId: 'stream1' });
      streamingManager.processStreamChunk = jest.fn().mockResolvedValue(true);
      streamingManager.endStream = jest.fn().mockResolvedValue({ success: true });

      const streamId = await streamingManager.startStream(messageId);
      expect(streamId).toBe('stream1');

      for (const chunk of streamData) {
        await streamingManager.processStreamChunk(streamId, chunk);
      }

      const result = await streamingManager.endStream(streamId);
      expect(result.success).toBe(true);
    });

    it('should handle real-time stream updates', async () => {
      const streamId = 'stream1';
      const updates = [
        { content: 'Hello', progress: 0.25 },
        { content: ' World', progress: 0.5 },
        { content: '!', progress: 1.0 }
      ];

      streamingManager.updateStream = jest.fn().mockResolvedValue(true);
      streamingManager.getStreamProgress = jest.fn().mockResolvedValue(1.0);

      for (const update of updates) {
        await streamingManager.updateStream(streamId, update);
      }

      const progress = await streamingManager.getStreamProgress(streamId);
      expect(progress).toBe(1.0);
    });

    it('should handle concurrent streams', async () => {
      const streams = [
        { streamId: 'stream1', messageId: 'msg1' },
        { streamId: 'stream2', messageId: 'msg2' },
        { streamId: 'stream3', messageId: 'msg3' }
      ];

      streamingManager.startStream = jest.fn().mockImplementation((messageId) => {
        const stream = streams.find(s => s.messageId === messageId);
        return Promise.resolve(stream.streamId);
      });

      streamingManager.processStreamChunk = jest.fn().mockResolvedValue(true);

      const streamIds = await Promise.all(
        streams.map(stream => streamingManager.startStream(stream.messageId))
      );

      expect(streamIds).toHaveLength(3);
      expect(streamIds).toEqual(['stream1', 'stream2', 'stream3']);

      // Process chunks for all streams concurrently
      await Promise.all(
        streamIds.map(streamId => 
          streamingManager.processStreamChunk(streamId, { content: 'test', timestamp: Date.now() })
        )
      );

      expect(streamingManager.processStreamChunk).toHaveBeenCalledTimes(3);
    });

    it('should handle stream rate limiting', async () => {
      const streamId = 'stream1';
      const chunks = Array.from({ length: 100 }, (_, i) => ({
        content: `chunk${i}`,
        timestamp: Date.now() + i
      }));

      streamingManager.processStreamChunk = jest.fn().mockResolvedValue(true);
      streamingManager.isRateLimited = jest.fn().mockResolvedValue(false);

      for (const chunk of chunks) {
        const isLimited = await streamingManager.isRateLimited(streamId);
        if (!isLimited) {
          await streamingManager.processStreamChunk(streamId, chunk);
        }
      }

      expect(streamingManager.processStreamChunk).toHaveBeenCalled();
    });
  });

  describe('Handle streaming errors', () => {
    it('should handle streaming errors gracefully', async () => {
      const streamId = 'stream1';
      const error = new Error('Stream connection lost');

      streamErrorHandler.handleStreamError = jest.fn().mockResolvedValue({
        handled: true,
        retry: true,
        fallback: false
      });

      const result = await streamErrorHandler.handleStreamError(streamId, error);

      expect(streamErrorHandler.handleStreamError).toHaveBeenCalledWith(streamId, error);
      expect(result.handled).toBe(true);
      expect(result.retry).toBe(true);
    });

    it('should handle network streaming errors', async () => {
      const streamId = 'stream1';
      const networkError = new Error('Network timeout');
      networkError.name = 'NetworkError';

      streamErrorHandler.handleNetworkError = jest.fn().mockResolvedValue({
        handled: true,
        retry: true,
        delay: 5000
      });

      const result = await streamErrorHandler.handleNetworkError(streamId, networkError);

      expect(streamErrorHandler.handleNetworkError).toHaveBeenCalledWith(streamId, networkError);
      expect(result.handled).toBe(true);
      expect(result.retry).toBe(true);
      expect(result.delay).toBe(5000);
    });

    it('should handle stream buffer overflow errors', async () => {
      const streamId = 'stream1';
      const bufferError = new Error('Buffer overflow');
      bufferError.name = 'BufferOverflowError';

      streamErrorHandler.handleBufferError = jest.fn().mockResolvedValue({
        handled: true,
        clearBuffer: true,
        resumeStream: true
      });

      const result = await streamErrorHandler.handleBufferError(streamId, bufferError);

      expect(streamErrorHandler.handleBufferError).toHaveBeenCalledWith(streamId, bufferError);
      expect(result.handled).toBe(true);
      expect(result.clearBuffer).toBe(true);
      expect(result.resumeStream).toBe(true);
    });

    it('should handle stream parsing errors', async () => {
      const streamId = 'stream1';
      const parsingError = new Error('Invalid JSON format');
      parsingError.name = 'ParsingError';

      streamErrorHandler.handleParsingError = jest.fn().mockResolvedValue({
        handled: true,
        skipChunk: true,
        continueStream: true
      });

      const result = await streamErrorHandler.handleParsingError(streamId, parsingError);

      expect(streamErrorHandler.handleParsingError).toHaveBeenCalledWith(streamId, parsingError);
      expect(result.handled).toBe(true);
      expect(result.skipChunk).toBe(true);
      expect(result.continueStream).toBe(true);
    });

    it('should handle stream timeout errors', async () => {
      const streamId = 'stream1';
      const timeoutError = new Error('Stream timeout');
      timeoutError.name = 'TimeoutError';

      streamErrorHandler.handleTimeoutError = jest.fn().mockResolvedValue({
        handled: true,
        retry: true,
        increaseTimeout: true
      });

      const result = await streamErrorHandler.handleTimeoutError(streamId, timeoutError);

      expect(streamErrorHandler.handleTimeoutError).toHaveBeenCalledWith(streamId, timeoutError);
      expect(result.handled).toBe(true);
      expect(result.retry).toBe(true);
      expect(result.increaseTimeout).toBe(true);
    });
  });

  describe('Handle non-streaming fallback', () => {
    it('should fallback to non-streaming when streaming fails', async () => {
      const messageId = 'msg1';
      const error = new Error('Streaming not supported');

      streamingManager.startStream = jest.fn().mockRejectedValue(error);
      streamingManager.fallbackToNonStreaming = jest.fn().mockResolvedValue({
        success: true,
        response: 'Fallback response'
      });

      try {
        await streamingManager.startStream(messageId);
      } catch (error) {
        const fallbackResult = await streamingManager.fallbackToNonStreaming(messageId);
        expect(fallbackResult.success).toBe(true);
        expect(fallbackResult.response).toBe('Fallback response');
      }
    });

    it('should detect streaming capability', async () => {
      const messageId = 'msg1';

      streamingManager.checkStreamingCapability = jest.fn().mockResolvedValue({
        supported: true,
        protocols: ['sse', 'websocket'],
        fallback: 'http'
      });

      const capability = await streamingManager.checkStreamingCapability(messageId);

      expect(capability.supported).toBe(true);
      expect(capability.protocols).toContain('sse');
      expect(capability.fallback).toBe('http');
    });

    it('should handle fallback response processing', async () => {
      const messageId = 'msg1';
      const fallbackResponse = 'Complete response from fallback';

      streamProcessor.processFallbackResponse = jest.fn().mockResolvedValue({
        success: true,
        content: fallbackResponse,
        processed: true
      });

      const result = await streamProcessor.processFallbackResponse(messageId, fallbackResponse);

      expect(streamProcessor.processFallbackResponse).toHaveBeenCalledWith(messageId, fallbackResponse);
      expect(result.success).toBe(true);
      expect(result.content).toBe(fallbackResponse);
    });

    it('should handle fallback quality degradation', async () => {
      const messageId = 'msg1';

      streamQualityManager.getFallbackQuality = jest.fn().mockResolvedValue({
        quality: 'reduced',
        reason: 'Streaming unavailable',
        features: ['basic_response']
      });

      const quality = await streamQualityManager.getFallbackQuality(messageId);

      expect(quality.quality).toBe('reduced');
      expect(quality.reason).toBe('Streaming unavailable');
      expect(quality.features).toContain('basic_response');
    });
  });

  describe('Verify content updates', () => {
    it('should verify content updates in real-time', async () => {
      const streamId = 'stream1';
      const contentUpdates = [
        { content: 'Hello', timestamp: Date.now() },
        { content: ' World', timestamp: Date.now() + 100 },
        { content: '!', timestamp: Date.now() + 200 }
      ];

      streamingManager.updateContent = jest.fn().mockResolvedValue(true);
      streamingManager.getCurrentContent = jest.fn().mockResolvedValue('Hello World!');

      for (const update of contentUpdates) {
        await streamingManager.updateContent(streamId, update);
      }

      const finalContent = await streamingManager.getCurrentContent(streamId);
      expect(finalContent).toBe('Hello World!');
    });

    it('should handle content update conflicts', async () => {
      const streamId = 'stream1';
      const conflictingUpdates = [
        { content: 'Hello', version: 1 },
        { content: 'Hi', version: 1 }, // Same version, different content
        { content: ' World', version: 2 }
      ];

      streamingManager.resolveContentConflict = jest.fn().mockResolvedValue({
        resolved: true,
        finalContent: 'Hello World',
        conflictsResolved: 1
      });

      const result = await streamingManager.resolveContentConflict(streamId, conflictingUpdates);

      expect(streamingManager.resolveContentConflict).toHaveBeenCalledWith(streamId, conflictingUpdates);
      expect(result.resolved).toBe(true);
      expect(result.finalContent).toBe('Hello World');
    });

    it('should handle content update validation', async () => {
      const streamId = 'stream1';
      const update = { content: 'Hello World!', timestamp: Date.now() };

      streamingManager.validateContentUpdate = jest.fn().mockResolvedValue({
        valid: true,
        sanitized: 'Hello World!',
        warnings: []
      });

      const validation = await streamingManager.validateContentUpdate(streamId, update);

      expect(streamingManager.validateContentUpdate).toHaveBeenCalledWith(streamId, update);
      expect(validation.valid).toBe(true);
      expect(validation.sanitized).toBe('Hello World!');
    });

    it('should handle content update batching', async () => {
      const streamId = 'stream1';
      const updates = Array.from({ length: 10 }, (_, i) => ({
        content: `chunk${i}`,
        timestamp: Date.now() + i
      }));

      streamingManager.batchContentUpdates = jest.fn().mockResolvedValue({
        batched: true,
        batchSize: 10,
        processed: 10
      });

      const result = await streamingManager.batchContentUpdates(streamId, updates);

      expect(streamingManager.batchContentUpdates).toHaveBeenCalledWith(streamId, updates);
      expect(result.batched).toBe(true);
      expect(result.batchSize).toBe(10);
    });
  });

  describe('Handle streaming cancellation', () => {
    it('should cancel streaming gracefully', async () => {
      const streamId = 'stream1';

      streamingManager.cancelStream = jest.fn().mockResolvedValue({
        success: true,
        cancelledAt: new Date(),
        cleanupPerformed: true
      });

      const result = await streamingManager.cancelStream(streamId);

      expect(streamingManager.cancelStream).toHaveBeenCalledWith(streamId);
      expect(result.success).toBe(true);
      expect(result.cleanupPerformed).toBe(true);
    });

    it('should handle cancellation of multiple streams', async () => {
      const streamIds = ['stream1', 'stream2', 'stream3'];

      streamingManager.cancelMultipleStreams = jest.fn().mockResolvedValue({
        results: [
          { streamId: 'stream1', success: true },
          { streamId: 'stream2', success: true },
          { streamId: 'stream3', success: false, error: 'Already cancelled' }
        ]
      });

      const result = await streamingManager.cancelMultipleStreams(streamIds);

      expect(streamingManager.cancelMultipleStreams).toHaveBeenCalledWith(streamIds);
      expect(result.results.filter(r => r.success)).toHaveLength(2);
      expect(result.results.filter(r => !r.success)).toHaveLength(1);
    });

    it('should handle cancellation cleanup', async () => {
      const streamId = 'stream1';

      streamingManager.cleanupCancelledStream = jest.fn().mockResolvedValue({
        cleaned: true,
        resourcesFreed: ['buffer', 'connections', 'timers'],
        memoryFreed: '2MB'
      });

      const result = await streamingManager.cleanupCancelledStream(streamId);

      expect(streamingManager.cleanupCancelledStream).toHaveBeenCalledWith(streamId);
      expect(result.cleaned).toBe(true);
      expect(result.resourcesFreed).toContain('buffer');
      expect(result.memoryFreed).toBe('2MB');
    });

    it('should handle cancellation of completed streams', async () => {
      const streamId = 'stream1';

      streamingManager.isStreamCompleted = jest.fn().mockResolvedValue(true);
      streamingManager.cancelStream = jest.fn().mockResolvedValue({
        success: false,
        error: 'Cannot cancel completed stream'
      });

      const isCompleted = await streamingManager.isStreamCompleted(streamId);
      if (isCompleted) {
        const result = await streamingManager.cancelStream(streamId);
        expect(result.success).toBe(false);
        expect(result.error).toBe('Cannot cancel completed stream');
      }
    });
  });

  describe('Test different response formats', () => {
    it('should handle JSON streaming format', async () => {
      const streamId = 'stream1';
      const jsonChunks = [
        '{"content": "Hello", "type": "text"}',
        '{"content": " World", "type": "text"}',
        '{"content": "!", "type": "text", "complete": true}'
      ];

      streamProcessor.processJSONChunk = jest.fn().mockResolvedValue({
        parsed: true,
        content: 'Hello World!',
        complete: true
      });

      for (const chunk of jsonChunks) {
        await streamProcessor.processJSONChunk(streamId, chunk);
      }

      expect(streamProcessor.processJSONChunk).toHaveBeenCalledTimes(3);
    });

    it('should handle text streaming format', async () => {
      const streamId = 'stream1';
      const textChunks = ['Hello', ' World', '!'];

      streamProcessor.processTextChunk = jest.fn().mockResolvedValue({
        processed: true,
        content: 'Hello World!',
        length: 12
      });

      for (const chunk of textChunks) {
        await streamProcessor.processTextChunk(streamId, chunk);
      }

      expect(streamProcessor.processTextChunk).toHaveBeenCalledTimes(3);
    });

    it('should handle binary streaming format', async () => {
      const streamId = 'stream1';
      const binaryChunks = [
        new Uint8Array([72, 101, 108, 108, 111]), // "Hello"
        new Uint8Array([32, 87, 111, 114, 108, 100]) // " World"
      ];

      streamProcessor.processBinaryChunk = jest.fn().mockResolvedValue({
        processed: true,
        decoded: 'Hello World',
        size: 11
      });

      for (const chunk of binaryChunks) {
        await streamProcessor.processBinaryChunk(streamId, chunk);
      }

      expect(streamProcessor.processBinaryChunk).toHaveBeenCalledTimes(2);
    });

    it('should handle mixed format streaming', async () => {
      const streamId = 'stream1';
      const mixedChunks = [
        { type: 'text', content: 'Hello' },
        { type: 'json', content: '{"world": true}' },
        { type: 'binary', content: new Uint8Array([33]) } // "!"
      ];

      streamProcessor.processMixedChunk = jest.fn().mockResolvedValue({
        processed: true,
        unified: 'Hello {"world": true}!',
        format: 'mixed'
      });

      for (const chunk of mixedChunks) {
        await streamProcessor.processMixedChunk(streamId, chunk);
      }

      expect(streamProcessor.processMixedChunk).toHaveBeenCalledTimes(3);
    });
  });

  describe('Plugin integration', () => {
    it('should integrate with streaming plugins', async () => {
      const streamId = 'stream1';
      const chunk = { content: 'Hello', timestamp: Date.now() };

      const streamingPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        processStreamChunk: jest.fn().mockReturnValue({ ...chunk, enhanced: true })
      };

      pluginManager.registerPlugin('streaming-processor', streamingPlugin);
      pluginManager.mountPlugin('streaming-processor');

      const result = await streamProcessor.processChunkWithPlugins(streamId, chunk);

      expect(streamingPlugin.processStreamChunk).toHaveBeenCalledWith(streamId, chunk);
      expect(result.enhanced).toBe(true);
    });

    it('should integrate with stream quality plugins', async () => {
      const streamId = 'stream1';

      const qualityPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        enhanceStreamQuality: jest.fn().mockReturnValue({
          quality: 'enhanced',
          features: ['compression', 'encryption']
        })
      };

      pluginManager.registerPlugin('quality-enhancer', qualityPlugin);
      pluginManager.mountPlugin('quality-enhancer');

      const result = await streamQualityManager.enhanceQualityWithPlugins(streamId);

      expect(qualityPlugin.enhanceStreamQuality).toHaveBeenCalledWith(streamId);
      expect(result.quality).toBe('enhanced');
      expect(result.features).toContain('compression');
    });

    it('should integrate with stream error handling plugins', async () => {
      const streamId = 'stream1';
      const error = new Error('Stream error');

      const errorPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        handleStreamError: jest.fn().mockReturnValue({
          handled: true,
          recovery: 'automatic'
        })
      };

      pluginManager.registerPlugin('error-handler', errorPlugin);
      pluginManager.mountPlugin('error-handler');

      const result = await streamErrorHandler.handleErrorWithPlugins(streamId, error);

      expect(errorPlugin.handleStreamError).toHaveBeenCalledWith(streamId, error);
      expect(result.handled).toBe(true);
      expect(result.recovery).toBe('automatic');
    });
  });

  describe('Strategy pattern integration', () => {
    it('should integrate with streaming strategies', async () => {
      const streamId = 'stream1';
      const chunk = { content: 'Hello', timestamp: Date.now() };

      const streamingStrategy = {
        process: jest.fn().mockResolvedValue(true),
        canProcess: () => true,
        getStrategy: () => 'real-time'
      };

      strategyManager.registerStrategy('streaming', streamingStrategy);
      strategyManager.selectStrategy('streaming', 'real-time');

      const result = await streamProcessor.processWithStrategy(streamId, chunk);

      expect(streamingStrategy.process).toHaveBeenCalledWith(streamId, chunk);
      expect(result).toBe(true);
    });

    it('should integrate with buffer strategies', async () => {
      const streamId = 'stream1';
      const chunks = [
        { content: 'Hello', timestamp: Date.now() },
        { content: ' World', timestamp: Date.now() + 100 }
      ];

      const bufferStrategy = {
        buffer: jest.fn().mockResolvedValue(true),
        canBuffer: () => true,
        getBufferSize: () => 1024
      };

      strategyManager.registerStrategy('buffer', bufferStrategy);
      strategyManager.selectStrategy('buffer', 'adaptive');

      const result = await streamBuffer.bufferWithStrategy(streamId, chunks);

      expect(bufferStrategy.buffer).toHaveBeenCalledWith(streamId, chunks);
      expect(result).toBe(true);
    });

    it('should integrate with quality strategies', async () => {
      const streamId = 'stream1';

      const qualityStrategy = {
        optimize: jest.fn().mockResolvedValue({
          optimized: true,
          quality: 'high',
          bandwidth: 'reduced'
        }),
        canOptimize: () => true,
        getOptimizationLevel: () => 'high'
      };

      strategyManager.registerStrategy('quality', qualityStrategy);
      strategyManager.selectStrategy('quality', 'adaptive');

      const result = await streamQualityManager.optimizeWithStrategy(streamId);

      expect(qualityStrategy.optimize).toHaveBeenCalledWith(streamId);
      expect(result.optimized).toBe(true);
      expect(result.quality).toBe('high');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle complete streaming workflow', async () => {
      const messageId = 'msg1';
      const chunks = [
        { content: 'Hello', timestamp: Date.now() },
        { content: ' World', timestamp: Date.now() + 100 },
        { content: '!', timestamp: Date.now() + 200 }
      ];

      // Mock all dependencies
      streamingManager.startStream = jest.fn().mockResolvedValue({ streamId: 'stream1' });
      streamingManager.processStreamChunk = jest.fn().mockResolvedValue(true);
      streamingManager.updateContent = jest.fn().mockResolvedValue(true);
      streamingManager.endStream = jest.fn().mockResolvedValue({ success: true });
      streamQualityManager.monitorQuality = jest.fn().mockResolvedValue({ quality: 'good' });
      streamErrorHandler.handleStreamError = jest.fn().mockResolvedValue({ handled: true });

      const streamId = await streamingManager.startStream(messageId);
      expect(streamId).toBe('stream1');

      for (const chunk of chunks) {
        await streamingManager.processStreamChunk(streamId, chunk);
        await streamingManager.updateContent(streamId, chunk);
      }

      const quality = await streamQualityManager.monitorQuality(streamId);
      expect(quality.quality).toBe('good');

      const result = await streamingManager.endStream(streamId);
      expect(result.success).toBe(true);
    });

    it('should handle streaming with error recovery', async () => {
      const messageId = 'msg1';
      const error = new Error('Network error');

      streamingManager.startStream = jest.fn().mockRejectedValue(error);
      streamErrorHandler.handleStreamError = jest.fn().mockResolvedValue({
        handled: true,
        retry: true,
        fallback: true
      });
      streamingManager.fallbackToNonStreaming = jest.fn().mockResolvedValue({
        success: true,
        response: 'Fallback response'
      });

      try {
        await streamingManager.startStream(messageId);
      } catch (error) {
        const errorResult = await streamErrorHandler.handleStreamError(messageId, error);
        expect(errorResult.handled).toBe(true);
        expect(errorResult.fallback).toBe(true);

        if (errorResult.fallback) {
          const fallbackResult = await streamingManager.fallbackToNonStreaming(messageId);
          expect(fallbackResult.success).toBe(true);
          expect(fallbackResult.response).toBe('Fallback response');
        }
      }
    });
  });
}); 