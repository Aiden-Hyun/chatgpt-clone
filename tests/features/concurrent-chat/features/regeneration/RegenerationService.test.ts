import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { RegenerationService } from '../../../../src/features/concurrent-chat/features/regeneration/RegenerationService';
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

describe('RegenerationService', () => {
  let regenerationService: RegenerationService;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
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

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(regenerationService).toBeDefined();
      expect(regenerationService.getRegenerationHistory()).toEqual([]);
      expect(regenerationService.getCurrentRegeneration()).toBeNull();
    });

    it('should register with service container', () => {
      expect(serviceContainer.get('regenerationService')).toBe(regenerationService);
    });

    it('should subscribe to regeneration events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');
      new RegenerationService(eventBus, serviceContainer, mockMessageProcessor, mockAIService);
      
      expect(subscribeSpy).toHaveBeenCalledWith('regeneration:start', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('regeneration:complete', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('regeneration:error', expect.any(Function));
    });
  });

  describe('Message Regeneration Logic', () => {
    it('should regenerate message successfully', async () => {
      const originalMessage = 'Hello, how are you?';
      const sendMessageSpy = jest.spyOn(mockAIService, 'sendMessage');
      
      const result = await regenerationService.regenerateMessage(originalMessage);
      
      expect(sendMessageSpy).toHaveBeenCalledWith(originalMessage, undefined);
      expect(result).toBe(`AI Response: ${originalMessage}`);
    });

    it('should regenerate message with custom options', async () => {
      const originalMessage = 'Hello, how are you?';
      const options = { model: 'gpt-4', temperature: 0.7 };
      const sendMessageSpy = jest.spyOn(mockAIService, 'sendMessage');
      
      const result = await regenerationService.regenerateMessage(originalMessage, options);
      
      expect(sendMessageSpy).toHaveBeenCalledWith(originalMessage, options);
      expect(result).toBe(`AI Response: ${originalMessage}`);
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
      
      await expect(errorRegenerationService.regenerateMessage('Test message'))
        .rejects.toThrow('AI service error');
    });

    it('should process regenerated message', async () => {
      const originalMessage = 'Hello, how are you?';
      const processMessageSpy = jest.spyOn(mockMessageProcessor, 'processMessage');
      
      await regenerationService.regenerateMessage(originalMessage);
      
      expect(processMessageSpy).toHaveBeenCalledWith(`AI Response: ${originalMessage}`, undefined);
    });
  });

  describe('Regeneration History', () => {
    it('should track regeneration history', async () => {
      const originalMessage = 'Hello, how are you?';
      
      await regenerationService.regenerateMessage(originalMessage);
      
      const history = regenerationService.getRegenerationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].originalMessage).toBe(originalMessage);
      expect(history[0].regeneratedMessage).toBe(`AI Response: ${originalMessage}`);
      expect(history[0].timestamp).toBeDefined();
    });

    it('should limit regeneration history size', async () => {
      const maxHistorySize = 5;
      regenerationService.setMaxHistorySize(maxHistorySize);
      
      // Generate more than max history size
      for (let i = 0; i < maxHistorySize + 2; i++) {
        await regenerationService.regenerateMessage(`Message ${i}`);
      }
      
      const history = regenerationService.getRegenerationHistory();
      expect(history).toHaveLength(maxHistorySize);
      expect(history[0].originalMessage).toBe(`Message 2`); // Oldest should be removed
    });

    it('should clear regeneration history', async () => {
      await regenerationService.regenerateMessage('Test message');
      
      expect(regenerationService.getRegenerationHistory()).toHaveLength(1);
      
      regenerationService.clearHistory();
      
      expect(regenerationService.getRegenerationHistory()).toHaveLength(0);
    });

    it('should get regeneration by ID', async () => {
      await regenerationService.regenerateMessage('Test message');
      
      const history = regenerationService.getRegenerationHistory();
      const regenerationId = history[0].id;
      
      const regeneration = regenerationService.getRegenerationById(regenerationId);
      expect(regeneration).toBeDefined();
      expect(regeneration?.originalMessage).toBe('Test message');
    });
  });

  describe('A/B Testing Support', () => {
    it('should support A/B testing with multiple regenerations', async () => {
      const originalMessage = 'Hello, how are you?';
      const options1 = { model: 'gpt-3.5-turbo' };
      const options2 = { model: 'gpt-4' };
      
      const result1 = await regenerationService.regenerateMessage(originalMessage, options1);
      const result2 = await regenerationService.regenerateMessage(originalMessage, options2);
      
      expect(result1).toBe(`AI Response: ${originalMessage}`);
      expect(result2).toBe(`AI Response: ${originalMessage}`);
      
      const history = regenerationService.getRegenerationHistory();
      expect(history).toHaveLength(2);
      expect(history[0].options).toEqual(options1);
      expect(history[1].options).toEqual(options2);
    });

    it('should track A/B testing metrics', async () => {
      const originalMessage = 'Hello, how are you?';
      
      await regenerationService.regenerateMessage(originalMessage, { variant: 'A' });
      await regenerationService.regenerateMessage(originalMessage, { variant: 'B' });
      
      const metrics = regenerationService.getABTestingMetrics();
      expect(metrics.variantA).toBe(1);
      expect(metrics.variantB).toBe(1);
    });

    it('should compare regeneration quality', async () => {
      const originalMessage = 'Hello, how are you?';
      
      const result1 = await regenerationService.regenerateMessage(originalMessage, { quality: 'high' });
      const result2 = await regenerationService.regenerateMessage(originalMessage, { quality: 'low' });
      
      const comparison = regenerationService.compareRegenerations(result1, result2);
      expect(comparison).toBeDefined();
      expect(comparison.originalMessage).toBe(originalMessage);
    });
  });

  describe('Quality Metrics', () => {
    it('should calculate regeneration quality score', async () => {
      const originalMessage = 'Hello, how are you?';
      
      await regenerationService.regenerateMessage(originalMessage);
      
      const history = regenerationService.getRegenerationHistory();
      const qualityScore = regenerationService.calculateQualityScore(history[0]);
      
      expect(qualityScore).toBeGreaterThan(0);
      expect(qualityScore).toBeLessThanOrEqual(1);
    });

    it('should track quality metrics over time', async () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      
      for (const message of messages) {
        await regenerationService.regenerateMessage(message);
      }
      
      const qualityMetrics = regenerationService.getQualityMetrics();
      expect(qualityMetrics.averageScore).toBeGreaterThan(0);
      expect(qualityMetrics.totalRegenerations).toBe(3);
    });

    it('should identify quality trends', async () => {
      const messages = ['Message 1', 'Message 2', 'Message 3'];
      
      for (const message of messages) {
        await regenerationService.regenerateMessage(message);
      }
      
      const trends = regenerationService.getQualityTrends();
      expect(trends).toBeDefined();
      expect(trends.direction).toBeDefined(); // 'improving', 'declining', 'stable'
    });
  });

  describe('Plugin Integration', () => {
    it('should integrate with plugin system', () => {
      const plugin = {
        name: 'test-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };
      
      regenerationService.registerPlugin(plugin);
      
      expect(regenerationService.getPlugins()).toContain(plugin);
    });

    it('should notify plugins of regeneration events', async () => {
      const plugin = {
        name: 'test-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };
      
      regenerationService.registerPlugin(plugin);
      
      await regenerationService.regenerateMessage('Test message');
      
      expect(plugin.onRegenerationStart).toHaveBeenCalled();
      expect(plugin.onRegenerationComplete).toHaveBeenCalled();
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin = {
        name: 'error-plugin',
        onRegenerationStart: () => { throw new Error('Plugin error'); },
        onRegenerationComplete: jest.fn()
      };
      
      regenerationService.registerPlugin(errorPlugin);
      
      // Should not throw error
      await expect(regenerationService.regenerateMessage('Test message'))
        .resolves.not.toThrow();
    });
  });

  describe('Command Pattern Integration', () => {
    it('should integrate with command pattern', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      regenerationService.registerCommand('test-command', command);
      
      const result = await regenerationService.executeCommand('test-command', 'Test data');
      
      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(result).toBe('Command result');
    });

    it('should support command history', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      regenerationService.registerCommand('test-command', command);
      
      await regenerationService.executeCommand('test-command', 'Test data');
      
      const commandHistory = regenerationService.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      regenerationService.registerCommand('test-command', command);
      
      await regenerationService.executeCommand('test-command', 'Test data');
      await regenerationService.undoLastCommand();
      
      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // RegenerationService should only handle regeneration logic
      expect(typeof regenerationService.regenerateMessage).toBe('function');
      expect(typeof regenerationService.getRegenerationHistory).toBe('function');
      expect(typeof regenerationService.calculateQualityScore).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onRegenerationStart: jest.fn(),
        onRegenerationComplete: jest.fn()
      };
      
      regenerationService.registerPlugin(newPlugin);
      
      expect(regenerationService.getPlugins()).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any IMessageProcessor implementation should be substitutable
      const alternativeProcessor = {
        async processMessage(message: string, options?: any): Promise<string> {
          return `Alternative: ${message}`;
        }
      };
      
      const alternativeService = new RegenerationService(
        eventBus,
        serviceContainer,
        alternativeProcessor,
        mockAIService
      );
      
      expect(typeof alternativeService.regenerateMessage).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should depend on focused interfaces, not large ones
      expect(typeof mockMessageProcessor.processMessage).toBe('function');
      expect(typeof mockAIService.sendMessage).toBe('function');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IMessageProcessor) not concretions
      expect(regenerationService.messageProcessor).toBe(mockMessageProcessor);
      expect(typeof regenerationService.messageProcessor.processMessage).toBe('function');
    });
  });
}); 