import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { StreamingService } from '../../../../src/features/concurrent-chat/features/streaming/StreamingService';
import { useMessageStreaming } from '../../../../src/features/concurrent-chat/features/streaming/useMessageStreaming';
import { IMessageProcessor } from '../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

// Mock message processor
class MockMessageProcessor implements IMessageProcessor {
  async processMessage(message: string, options?: any): Promise<string> {
    return `Processed: ${message}`;
  }
}

// Mock AI service
class MockAIService {
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

describe('useMessageStreaming', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let streamingService: StreamingService;
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

  describe('Streaming State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      expect(result.current.isStreaming).toBe(false);
      expect(result.current.streamingHistory).toEqual([]);
      expect(result.current.currentStream).toBeNull();
      expect(result.current.streamedContent).toBe('');
    });

    it('should update streaming state when streaming starts', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.isStreaming).toBe(false); // Streaming completed
      expect(result.current.streamingHistory).toHaveLength(1);
    });

    it('should track streaming progress', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Subscribe to progress events
      eventBus.subscribe('streaming:progress', (data) => {
        act(() => {
          result.current.updateProgress(data.progress);
        });
      });

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.currentProgress).toBe(1.0);
    });

    it('should handle streaming state transitions', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      expect(result.current.isStreaming).toBe(false);

      const streamingPromise = act(async () => {
        return result.current.startStreaming('Test message');
      });

      // Streaming should be in progress
      expect(result.current.isStreaming).toBe(true);

      await streamingPromise;

      // Streaming should be complete
      expect(result.current.isStreaming).toBe(false);
    });
  });

  describe('Stream Controls', () => {
    it('should start streaming', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Hello, how are you?');
      });

      expect(result.current.streamingHistory).toHaveLength(1);
      expect(result.current.streamingHistory[0].message).toBe('Hello, how are you?');
    });

    it('should start streaming with custom options', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      const options = { model: 'gpt-4', temperature: 0.7 };

      await act(async () => {
        await result.current.startStreaming('Test message', options);
      });

      expect(result.current.streamingHistory).toHaveLength(1);
      expect(result.current.streamingHistory[0].options).toEqual(options);
    });

    it('should pause streaming', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      const streamingPromise = act(async () => {
        return result.current.startStreaming('Long message');
      });

      act(() => {
        result.current.pauseStreaming();
      });

      expect(result.current.isPaused).toBe(true);

      act(() => {
        result.current.resumeStreaming();
      });

      await streamingPromise;
      expect(result.current.isPaused).toBe(false);
    });

    it('should stop streaming', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      const streamingPromise = act(async () => {
        return result.current.startStreaming('Long message');
      });

      act(() => {
        result.current.stopStreaming();
      });

      await expect(streamingPromise).rejects.toThrow();
      expect(result.current.isStreaming).toBe(false);
    });

    it('should set streaming speed', () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      act(() => {
        result.current.setStreamingSpeed(2.0);
      });

      expect(result.current.streamingSpeed).toBe(2.0);
    });
  });

  describe('Quality Monitoring', () => {
    it('should monitor stream quality', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.qualityMetrics).toBeDefined();
      expect(result.current.qualityMetrics.chunkCount).toBeGreaterThan(0);
      expect(result.current.qualityMetrics.averageChunkSize).toBeGreaterThan(0);
    });

    it('should detect quality issues', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const qualityIssues = result.current.detectQualityIssues();
      expect(qualityIssues).toBeDefined();
      expect(Array.isArray(qualityIssues)).toBe(true);
    });

    it('should track quality trends', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Message 1');
        await result.current.startStreaming('Message 2');
        await result.current.startStreaming('Message 3');
      });

      const trends = result.current.getQualityTrends();
      expect(trends).toBeDefined();
      expect(trends.direction).toBeDefined();
    });

    it('should optimize quality settings', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const optimizationResult = result.current.optimizeQuality();
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.improvements).toBeDefined();
    });
  });

  describe('Plugin Lifecycle Integration', () => {
    it('should integrate with plugin lifecycle', () => {
      const plugin = {
        name: 'test-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };

      streamingService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      expect(result.current.plugins).toContain(plugin);
    });

    it('should notify plugins of streaming events', async () => {
      const plugin = {
        name: 'test-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };

      streamingService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(plugin.onStreamingStart).toHaveBeenCalled();
      expect(plugin.onStreamingChunk).toHaveBeenCalled();
      expect(plugin.onStreamingComplete).toHaveBeenCalled();
    });

    it('should handle plugin lifecycle events', () => {
      const plugin = {
        name: 'test-plugin',
        onMount: jest.fn(),
        onUnmount: jest.fn()
      };

      const { result, unmount } = renderHook(() => useMessageStreaming(streamingService));
      
      streamingService.registerPlugin(plugin);

      expect(plugin.onMount).toHaveBeenCalled();

      unmount();

      expect(plugin.onUnmount).toHaveBeenCalled();
    });
  });

  describe('Strategy Integration', () => {
    it('should use different streaming strategies', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Test default strategy
      act(() => {
        result.current.setStreamingStrategy('default');
      });

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.currentStrategy).toBe('default');

      // Test alternative strategy
      act(() => {
        result.current.setStreamingStrategy('alternative');
      });

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.currentStrategy).toBe('alternative');
    });

    it('should handle strategy errors gracefully', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Set invalid strategy
      act(() => {
        result.current.setStreamingStrategy('invalid');
      });

      await expect(act(async () => {
        await result.current.startStreaming('Test message');
      })).rejects.toThrow();
    });

    it('should optimize strategy performance', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const optimizationResult = result.current.optimizeStrategy();
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.recommendedStrategy).toBeDefined();
    });
  });

  describe('Stream Analytics', () => {
    it('should track streaming analytics', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.analytics).toBeDefined();
      expect(result.current.analytics.totalStreams).toBeGreaterThan(0);
      expect(result.current.analytics.averageStreamDuration).toBeGreaterThan(0);
    });

    it('should generate streaming reports', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const report = result.current.generateReport();
      expect(report).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.metrics).toBeDefined();
    });

    it('should track performance trends', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Message 1');
        await result.current.startStreaming('Message 2');
        await result.current.startStreaming('Message 3');
      });

      const trends = result.current.getPerformanceTrends();
      expect(trends).toBeDefined();
      expect(trends.direction).toBeDefined();
    });
  });

  describe('Stream Buffer Management', () => {
    it('should manage stream buffer', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const buffer = result.current.getStreamBuffer();
      expect(buffer).toBeDefined();
      expect(buffer.length).toBeGreaterThanOrEqual(0);
    });

    it('should clear stream buffer', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      expect(result.current.getStreamBuffer().length).toBeGreaterThan(0);

      act(() => {
        result.current.clearStreamBuffer();
      });

      expect(result.current.getStreamBuffer().length).toBe(0);
    });

    it('should optimize buffer size', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.startStreaming('Test message');
      });

      const optimizationResult = result.current.optimizeBufferSize();
      expect(optimizationResult).toBeDefined();
      expect(optimizationResult.recommendedSize).toBeDefined();
    });
  });

  describe('Error Handling', () => {
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

      const { result } = renderHook(() => useMessageStreaming(errorStreamingService));

      await expect(act(async () => {
        await result.current.startStreaming('Test message');
      })).rejects.toThrow('Streaming error');

      expect(result.current.isStreaming).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Simulate network error
      act(() => {
        result.current.simulateNetworkError();
      });

      expect(result.current.hasNetworkError).toBe(true);
      expect(result.current.networkErrorCount).toBeGreaterThan(0);
    });

    it('should retry failed streams', async () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      await act(async () => {
        await result.current.retryFailedStream();
      });

      expect(result.current.retryCount).toBeGreaterThan(0);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Hook should only handle streaming state and controls
      expect(typeof result.current.startStreaming).toBe('function');
      expect(typeof result.current.pauseStreaming).toBe('function');
      expect(typeof result.current.stopStreaming).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onStreamingStart: jest.fn(),
        onStreamingChunk: jest.fn(),
        onStreamingComplete: jest.fn()
      };

      streamingService.registerPlugin(newPlugin);

      expect(result.current.plugins).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any streaming service should be substitutable
      const alternativeService = new StreamingService(
        eventBus,
        serviceContainer,
        mockMessageProcessor,
        mockAIService
      );

      const { result } = renderHook(() => useMessageStreaming(alternativeService));

      expect(typeof result.current.startStreaming).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      // Should depend on focused interfaces, not large ones
      expect(result.current).toHaveProperty('startStreaming');
      expect(result.current).toHaveProperty('pauseStreaming');
      expect(result.current).toHaveProperty('stopStreaming');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (StreamingService) not concretions
      const { result } = renderHook(() => useMessageStreaming(streamingService));

      expect(result.current.streamingService).toBe(streamingService);
      expect(typeof result.current.streamingService.startStreaming).toBe('function');
    });
  });
}); 