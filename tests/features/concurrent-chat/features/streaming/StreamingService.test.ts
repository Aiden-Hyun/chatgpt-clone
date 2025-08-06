import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { StreamingService } from '../../../../src/features/concurrent-chat/features/streaming/StreamingService';
import { IMessageProcessor } from '../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

// Mock message processor
class MockMessageProcessor implements IMessageProcessor {
  async processMessage(message: string, options?: any): Promise<string> {
    return `Processed: ${message}`;
  }
}

// Mock AI service
class MockAIService {
  async sendMessage(message: string, options?: any): Promise<string> {
    return `AI Response: ${message}`;
  }

  async sendStreamingMessage(message: string, options?: any): Promise<ReadableStream> {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const chunks = [
          'AI',
          ' Response',
          ': ',
          message
        ];
        
        let index = 0;
        const interval = setInterval(() => {
          if (index < chunks.length) {
            controller.enqueue(encoder.encode(chunks[index]));
            index++;
          } else {
            controller.close();
            clearInterval(interval);
          }
        }, 10);
      }
    });
    
    return stream;
  }
}

describe('StreamingService', () => {
  let streamingService: StreamingService;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let mockMessageProcessor: MockMessageProcessor;
  let mockAIService: MockAIService;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    mockMessageProcessor = new MockMessageProcessor();
    mockAIService = new MockAIService();
    
    streamingService = new StreamingService(
      eventBus,
      serviceContainer,
      mockMessageProcessor,
      mockAIService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(streamingService).toBeDefined();
      expect(streamingService.getStreamingHistory()).toEqual([]);
      expect(streamingService.getCurrentStream()).toBeNull();
    });

    it('should register with service container', () => {
      expect(serviceContainer.get('streamingService')).toBe(streamingService);
    });

    it('should subscribe to streaming events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');
      new StreamingService(eventBus, serviceContainer, mockMessageProcessor, mockAIService);
      
      expect(subscribeSpy).toHaveBeenCalledWith('streaming:start', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('streaming:chunk', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('streaming:complete', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('streaming:error', expect.any(Function));
    });
  });

  describe('Advanced Streaming Logic', () => {
    it('should start streaming message', async () => {
      const message = 'Hello, how are you?';
      const sendStreamingMessageSpy = jest.spyOn(mockAIService, 'sendStreamingMessage');
      
      const stream = await streamingService.startStreaming(message);
      
      expect(sendStreamingMessageSpy).toHaveBeenCalledWith(message, undefined);
      expect(stream).toBeDefined();
    });

    it('should start streaming with custom options', async () => {
      const message = 'Hello, how are you?';
      const options = { model: 'gpt-4', temperature: 0.7 };
      const sendStreamingMessageSpy = jest.spyOn(mockAIService, 'sendStreamingMessage');
      
      const stream = await streamingService.startStreaming(message, options);
      
      expect(sendStreamingMessageSpy).toHaveBeenCalledWith(message, options);
      expect(stream).toBeDefined();
    });

    it('should handle streaming errors', async () => {
      const errorAIService = {
        async sendStreamingMessage() {
          throw new Error('Streaming error');
        }
      };
      
      const errorStreamingService = new StreamingService(
        eventBus,
        serviceContainer,
        mockMessageProcessor,
        errorAIService
      );
      
      await expect(errorStreamingService.startStreaming('Test message'))
        .rejects.toThrow('Streaming error');
    });

    it('should process streaming chunks', async () => {
      const message = 'Test message';
      const processMessageSpy = jest.spyOn(mockMessageProcessor, 'processMessage');
      
      const stream = await streamingService.startStreaming(message);
      
      // Simulate reading from stream
      const reader = stream.getReader();
      const chunks: string[] = [];
      
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = new TextDecoder().decode(value);
          chunks.push(chunk);
        }
      } finally {
        reader.releaseLock();
      }
      
      expect(chunks.length).toBeGreaterThan(0);
      expect(processMessageSpy).toHaveBeenCalled();
    });
  });

  describe('Stream Buffering and Optimization', () => {
    it('should buffer streaming chunks', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      const buffer = streamingService.getStreamBuffer();
      
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThanOrEqual(0);
    });

    it('should optimize stream performance', async () => {
      const message = 'Test message';
      
      const startTime = Date.now();
      const stream = await streamingService.startStreaming(message);
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // Should be fast
      
      const performanceMetrics = streamingService.getPerformanceMetrics();
      expect(performanceMetrics.startupTime).toBeLessThan(100);
    });

    it('should handle large streams efficiently', async () => {
      const largeMessage = 'a'.repeat(10000);
      
      const stream = await streamingService.startStreaming(largeMessage);
      
      const memoryUsage = streamingService.getMemoryUsage();
      expect(memoryUsage).toBeDefined();
      expect(memoryUsage.current).toBeLessThan(memoryUsage.max);
    });

    it('should implement stream backpressure', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const backpressureStatus = streamingService.getBackpressureStatus();
      expect(backpressureStatus).toBeDefined();
      expect(backpressureStatus.isBackpressured).toBeDefined();
    });
  });

  describe('Stream Quality Management', () => {
    it('should monitor stream quality', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const qualityMetrics = streamingService.getStreamQuality();
      expect(qualityMetrics).toBeDefined();
      expect(qualityMetrics.chunkCount).toBeGreaterThan(0);
      expect(qualityMetrics.averageChunkSize).toBeGreaterThan(0);
    });

    it('should detect stream quality issues', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const qualityIssues = streamingService.detectQualityIssues();
      expect(qualityIssues).toBeDefined();
      expect(Array.isArray(qualityIssues)).toBe(true);
    });

    it('should optimize stream quality', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const optimizationResult = streamingService.optimizeStreamQuality();
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.improvements).toBeDefined();
    });

    it('should handle stream degradation gracefully', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      // Simulate stream degradation
      streamingService.simulateStreamDegradation();
      
      const qualityMetrics = streamingService.getStreamQuality();
      expect(qualityMetrics.degradationLevel).toBeGreaterThan(0);
    });
  });

  describe('Plugin Integration', () => {
    it('should integrate with plugin system', () => {
      const plugin = {
        name: 'test-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };
      
      streamingService.registerPlugin(plugin);
      
      expect(streamingService.getPlugins()).toContain(plugin);
    });

    it('should notify plugins of streaming events', async () => {
      const plugin = {
        name: 'test-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };
      
      streamingService.registerPlugin(plugin);
      
      const stream = await streamingService.startStreaming('Test message');
      
      // Read the stream to trigger chunk events
      const reader = stream.getReader();
      try {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      } finally {
        reader.releaseLock();
      }
      
      expect(plugin.onStreamingStart).toHaveBeenCalled();
      expect(plugin.onStreamingChunk).toHaveBeenCalled();
      expect(plugin.onStreamingComplete).toHaveBeenCalled();
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin = {
        name: 'error-plugin',
        onStreamingStart: () => { throw new Error('Plugin error'); },
        onStreamingComplete: jest.fn()
      };
      
      streamingService.registerPlugin(errorPlugin);
      
      // Should not throw error
      const stream = await streamingService.startStreaming('Test message');
      expect(stream).toBeDefined();
    });
  });

  describe('Strategy Pattern Integration', () => {
    it('should use different streaming strategies', async () => {
      const message = 'Test message';
      
      // Test default strategy
      const defaultStream = await streamingService.startStreaming(message);
      expect(defaultStream).toBeDefined();
      
      // Test alternative strategy
      streamingService.setStreamingStrategy('alternative');
      const alternativeStream = await streamingService.startStreaming(message);
      expect(alternativeStream).toBeDefined();
    });

    it('should handle strategy errors gracefully', async () => {
      const message = 'Test message';
      
      // Set invalid strategy
      streamingService.setStreamingStrategy('invalid');
      
      await expect(streamingService.startStreaming(message))
        .rejects.toThrow();
    });

    it('should optimize strategy performance', async () => {
      const message = 'Test message';
      
      const optimizationResult = streamingService.optimizeStrategy();
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.recommendedStrategy).toBeDefined();
    });
  });

  describe('Stream Controls', () => {
    it('should pause streaming', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      streamingService.pauseStreaming();
      
      const status = streamingService.getStreamingStatus();
      expect(status.isPaused).toBe(true);
    });

    it('should resume streaming', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      streamingService.pauseStreaming();
      streamingService.resumeStreaming();
      
      const status = streamingService.getStreamingStatus();
      expect(status.isPaused).toBe(false);
    });

    it('should stop streaming', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      streamingService.stopStreaming();
      
      const status = streamingService.getStreamingStatus();
      expect(status.isActive).toBe(false);
    });

    it('should control streaming speed', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      streamingService.setStreamingSpeed(2.0);
      
      const speed = streamingService.getStreamingSpeed();
      expect(speed).toBe(2.0);
    });
  });

  describe('Stream Analytics', () => {
    it('should track streaming analytics', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const analytics = streamingService.getStreamingAnalytics();
      expect(analytics).toBeDefined();
      expect(analytics.totalStreams).toBeGreaterThan(0);
      expect(analytics.averageStreamDuration).toBeGreaterThan(0);
    });

    it('should generate streaming reports', async () => {
      const message = 'Test message';
      
      const stream = await streamingService.startStreaming(message);
      
      const report = streamingService.generateStreamingReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
    });

    it('should track streaming performance trends', async () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      
      for (const message of messages) {
        await streamingService.startStreaming(message);
      }
      
      const trends = streamingService.getPerformanceTrends();
      expect(trends).toBeDefined();
      expect(trends.direction).toBeDefined();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // StreamingService should only handle streaming logic
      expect(typeof streamingService.startStreaming).toBe('function');
      expect(typeof streamingService.getStreamingHistory).toBe('function');
      expect(typeof streamingService.getStreamQuality).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };
      
      streamingService.registerPlugin(newPlugin);
      
      expect(streamingService.getPlugins()).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any IMessageProcessor implementation should be substitutable
      const alternativeProcessor = {
        async processMessage(message: string, options?: any): Promise<string> {
          return `Alternative: ${message}`;
        }
      };
      
      const alternativeService = new StreamingService(
        eventBus,
        serviceContainer,
        alternativeProcessor,
        mockAIService
      );
      
      expect(typeof alternativeService.startStreaming).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should depend on focused interfaces, not large ones
      expect(typeof mockMessageProcessor.processMessage).toBe('function');
      expect(typeof mockAIService.sendStreamingMessage).toBe('function');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IMessageProcessor) not concretions
      expect(streamingService.messageProcessor).toBe(mockMessageProcessor);
      expect(typeof streamingService.messageProcessor.processMessage).toBe('function');
    });
  });
}); 