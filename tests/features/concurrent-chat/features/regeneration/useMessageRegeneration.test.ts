import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { RegenerationService } from '../../../../src/features/concurrent-chat/features/regeneration/RegenerationService';
import { useMessageRegeneration } from '../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration';
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
}

describe('useMessageRegeneration', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let regenerationService: RegenerationService;
  let mockMessageProcessor: MockMessageProcessor;
  let mockAIService: MockAIService;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    mockMessageProcessor = new MockMessageProcessor();
    mockAIService = new MockAIService();
    
    regenerationService = new RegenerationService(
      eventBus,
      serviceContainer,
      mockMessageProcessor,
      mockAIService
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Regeneration State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      expect(result.current.isRegenerating).toBe(false);
      expect(result.current.regenerationHistory).toEqual([]);
      expect(result.current.currentRegeneration).toBeNull();
      expect(result.current.qualityMetrics).toBeDefined();
    });

    it('should update regeneration state when regeneration starts', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message');
      });

      expect(result.current.isRegenerating).toBe(false); // Regeneration completed
      expect(result.current.regenerationHistory).toHaveLength(1);
    });

    it('should track regeneration progress', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      // Subscribe to progress events
      eventBus.subscribe('regeneration:progress', (data) => {
        act(() => {
          result.current.updateProgress(data.progress);
        });
      });

      await act(async () => {
        await result.current.regenerateMessage('Test message');
      });

      expect(result.current.currentProgress).toBe(1.0);
    });

    it('should handle regeneration state transitions', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      expect(result.current.isRegenerating).toBe(false);

      const regenerationPromise = act(async () => {
        return result.current.regenerateMessage('Test message');
      });

      // Regeneration should be in progress
      expect(result.current.isRegenerating).toBe(true);

      await regenerationPromise;

      // Regeneration should be complete
      expect(result.current.isRegenerating).toBe(false);
    });
  });

  describe('Regeneration Triggers', () => {
    it('should trigger regeneration with message', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Hello, how are you?');
      });

      expect(result.current.regenerationHistory).toHaveLength(1);
      expect(result.current.regenerationHistory[0].originalMessage).toBe('Hello, how are you?');
    });

    it('should trigger regeneration with custom options', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      const options = { model: 'gpt-4', temperature: 0.7 };

      await act(async () => {
        await result.current.regenerateMessage('Test message', options);
      });

      expect(result.current.regenerationHistory).toHaveLength(1);
      expect(result.current.regenerationHistory[0].options).toEqual(options);
    });

    it('should trigger multiple regenerations', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Message 1');
        await result.current.regenerateMessage('Message 2');
        await result.current.regenerateMessage('Message 3');
      });

      expect(result.current.regenerationHistory).toHaveLength(3);
      expect(result.current.regenerationHistory[0].originalMessage).toBe('Message 1');
      expect(result.current.regenerationHistory[1].originalMessage).toBe('Message 2');
      expect(result.current.regenerationHistory[2].originalMessage).toBe('Message 3');
    });

    it('should handle regeneration errors', async () => {
      const errorAIService = {
        async sendMessage() {
          throw new Error('AI service error');
        }
      };

      const errorRegenerationService = new RegenerationService(
        eventBus,
        serviceContainer,
        mockMessageProcessor,
        errorAIService
      );

      const { result } = renderHook(() => useMessageRegeneration(errorRegenerationService));

      await expect(act(async () => {
        await result.current.regenerateMessage('Test message');
      })).rejects.toThrow('AI service error');

      expect(result.current.isRegenerating).toBe(false);
    });
  });

  describe('History Management', () => {
    it('should manage regeneration history', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Message 1');
        await result.current.regenerateMessage('Message 2');
      });

      expect(result.current.regenerationHistory).toHaveLength(2);
      expect(result.current.getRegenerationById(result.current.regenerationHistory[0].id)).toBeDefined();
    });

    it('should clear regeneration history', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message');
      });

      expect(result.current.regenerationHistory).toHaveLength(1);

      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.regenerationHistory).toHaveLength(0);
    });

    it('should limit history size', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      const maxHistorySize = 3;
      act(() => {
        result.current.setMaxHistorySize(maxHistorySize);
      });

      await act(async () => {
        await result.current.regenerateMessage('Message 1');
        await result.current.regenerateMessage('Message 2');
        await result.current.regenerateMessage('Message 3');
        await result.current.regenerateMessage('Message 4');
      });

      expect(result.current.regenerationHistory).toHaveLength(maxHistorySize);
      expect(result.current.regenerationHistory[0].originalMessage).toBe('Message 2'); // Oldest removed
    });

    it('should get regeneration by ID', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message');
      });

      const regenerationId = result.current.regenerationHistory[0].id;
      const regeneration = result.current.getRegenerationById(regenerationId);

      expect(regeneration).toBeDefined();
      expect(regeneration?.originalMessage).toBe('Test message');
    });
  });

  describe('Plugin Lifecycle Integration', () => {
    it('should integrate with plugin lifecycle', () => {
      const plugin = {
        name: 'test-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };

      regenerationService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      expect(result.current.plugins).toContain(plugin);
    });

    it('should notify plugins of regeneration events', async () => {
      const plugin = {
        name: 'test-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };

      regenerationService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message');
      });

      expect(plugin.onRegenerationStart).toHaveBeenCalled();
      expect(plugin.onRegenerationComplete).toHaveBeenCalled();
    });

    it('should handle plugin lifecycle events', () => {
      const plugin = {
        name: 'test-plugin',
        onMount: jest.fn(),
        onUnmount: jest.fn()
      };

      const { result, unmount } = renderHook(() => useMessageRegeneration(regenerationService));
      
      regenerationService.registerPlugin(plugin);

      expect(plugin.onMount).toHaveBeenCalled();

      unmount();

      expect(plugin.onUnmount).toHaveBeenCalled();
    });
  });

  describe('Command Integration', () => {
    it('should integrate with command pattern', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      const commandResult = await act(async () => {
        return result.current.executeCommand('test-command', 'Test data');
      });

      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(commandResult).toBe('Command result');
    });

    it('should support command history', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
      });

      const commandHistory = result.current.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
        await result.current.undoLastCommand();
      });

      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('Quality Metrics', () => {
    it('should track quality metrics', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Message 1');
        await result.current.regenerateMessage('Message 2');
        await result.current.regenerateMessage('Message 3');
      });

      expect(result.current.qualityMetrics.totalRegenerations).toBe(3);
      expect(result.current.qualityMetrics.averageScore).toBeGreaterThan(0);
    });

    it('should calculate quality trends', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Message 1');
        await result.current.regenerateMessage('Message 2');
        await result.current.regenerateMessage('Message 3');
      });

      const trends = result.current.getQualityTrends();
      expect(trends).toBeDefined();
      expect(trends.direction).toBeDefined();
    });

    it('should compare regeneration quality', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message', { quality: 'high' });
        await result.current.regenerateMessage('Test message', { quality: 'low' });
      });

      const comparison = result.current.compareRegenerations(
        result.current.regenerationHistory[0],
        result.current.regenerationHistory[1]
      );

      expect(comparison).toBeDefined();
      expect(comparison.originalMessage).toBe('Test message');
    });
  });

  describe('A/B Testing', () => {
    it('should support A/B testing', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message', { variant: 'A' });
        await result.current.regenerateMessage('Test message', { variant: 'B' });
      });

      const metrics = result.current.getABTestingMetrics();
      expect(metrics.variantA).toBe(1);
      expect(metrics.variantB).toBe(1);
    });

    it('should track A/B testing performance', async () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      await act(async () => {
        await result.current.regenerateMessage('Test message', { variant: 'A', performance: 'fast' });
        await result.current.regenerateMessage('Test message', { variant: 'B', performance: 'slow' });
      });

      const performanceMetrics = result.current.getABTestingPerformance();
      expect(performanceMetrics).toBeDefined();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      // Hook should only handle regeneration state and controls
      expect(typeof result.current.regenerateMessage).toBe('function');
      expect(typeof result.current.clearHistory).toBe('function');
      expect(typeof result.current.getQualityMetrics).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };

      regenerationService.registerPlugin(newPlugin);

      expect(result.current.plugins).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any regeneration service should be substitutable
      const alternativeService = new RegenerationService(
        eventBus,
        serviceContainer,
        mockMessageProcessor,
        mockAIService
      );

      const { result } = renderHook(() => useMessageRegeneration(alternativeService));

      expect(typeof result.current.regenerateMessage).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      // Should depend on focused interfaces, not large ones
      expect(result.current).toHaveProperty('regenerateMessage');
      expect(result.current).toHaveProperty('clearHistory');
      expect(result.current).toHaveProperty('getQualityMetrics');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (RegenerationService) not concretions
      const { result } = renderHook(() => useMessageRegeneration(regenerationService));

      expect(result.current.regenerationService).toBe(regenerationService);
      expect(typeof result.current.regenerationService.regenerateMessage).toBe('function');
    });
  });
}); 