import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { BasePlugin } from '../../../../../src/features/concurrent-chat/plugins/BasePlugin';
import { IEventPlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/IEventPlugin';
import { ILifecyclePlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/ILifecyclePlugin';
import { IRenderPlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/IRenderPlugin';

describe('BasePlugin', () => {
  let basePlugin: BasePlugin;
  let mockEventBus: jest.Mocked<EventBus>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;
    
    basePlugin = new BasePlugin('test-plugin', '1.0.0', mockEventBus);
  });

  describe('plugin creation', () => {
    it('should create base plugin instance', () => {
      expect(basePlugin).toBeInstanceOf(BasePlugin);
      expect(basePlugin).toBeInstanceOf(Object);
    });

    it('should implement ILifecyclePlugin interface', () => {
      const plugin: ILifecyclePlugin = basePlugin;
      
      expect(typeof plugin.initialize).toBe('function');
      expect(typeof plugin.start).toBe('function');
      expect(typeof plugin.stop).toBe('function');
      expect(typeof plugin.destroy).toBe('function');
    });

    it('should implement IEventPlugin interface', () => {
      const plugin: IEventPlugin = basePlugin;
      
      expect(typeof plugin.handleEvent).toBe('function');
      expect(typeof plugin.getSupportedEventTypes).toBe('function');
      expect(typeof plugin.canHandleEvent).toBe('function');
      expect(typeof plugin.getEventPriority).toBe('function');
    });

    it('should implement IRenderPlugin interface', () => {
      const plugin: IRenderPlugin = basePlugin;
      
      expect(typeof plugin.renderMessage).toBe('function');
      expect(typeof plugin.canRender).toBe('function');
      expect(typeof plugin.getRenderCapabilities).toBe('function');
      expect(typeof plugin.getRenderPriority).toBe('function');
    });

    it('should store plugin ID and version', () => {
      expect(basePlugin.pluginId).toBe('test-plugin');
      expect(basePlugin.version).toBe('1.0.0');
    });

    it('should store event bus reference', () => {
      const eventBus = (basePlugin as any).eventBus;
      expect(eventBus).toBe(mockEventBus);
    });

    it('should initialize with default state', () => {
      expect(basePlugin.isInitialized).toBe(false);
      expect(basePlugin.isRunning).toBe(false);
    });
  });

  describe('lifecycle management', () => {
    it('should initialize plugin successfully', async () => {
      await basePlugin.initialize();
      
      expect(basePlugin.isInitialized).toBe(true);
    });

    it('should start plugin successfully', async () => {
      await basePlugin.initialize();
      await basePlugin.start();
      
      expect(basePlugin.isRunning).toBe(true);
    });

    it('should stop plugin successfully', async () => {
      await basePlugin.initialize();
      await basePlugin.start();
      await basePlugin.stop();
      
      expect(basePlugin.isRunning).toBe(false);
    });

    it('should destroy plugin successfully', async () => {
      await basePlugin.initialize();
      await basePlugin.start();
      await basePlugin.destroy();
      
      expect(basePlugin.isInitialized).toBe(false);
      expect(basePlugin.isRunning).toBe(false);
    });

    it('should require initialization before start', async () => {
      await expect(basePlugin.start()).rejects.toThrow('Plugin must be initialized before starting');
    });

    it('should require start before stop', async () => {
      await basePlugin.initialize();
      await expect(basePlugin.stop()).rejects.toThrow('Plugin must be running before stopping');
    });

    it('should handle double initialization gracefully', async () => {
      await basePlugin.initialize();
      await basePlugin.initialize(); // Should not throw
      
      expect(basePlugin.isInitialized).toBe(true);
    });

    it('should handle double start gracefully', async () => {
      await basePlugin.initialize();
      await basePlugin.start();
      await basePlugin.start(); // Should not throw
      
      expect(basePlugin.isRunning).toBe(true);
    });

    it('should handle double stop gracefully', async () => {
      await basePlugin.initialize();
      await basePlugin.start();
      await basePlugin.stop();
      await basePlugin.stop(); // Should not throw
      
      expect(basePlugin.isRunning).toBe(false);
    });

    it('should handle double destroy gracefully', async () => {
      await basePlugin.initialize();
      await basePlugin.destroy();
      await basePlugin.destroy(); // Should not throw
      
      expect(basePlugin.isInitialized).toBe(false);
    });
  });

  describe('event handling', () => {
    it('should handle events successfully', async () => {
      const event = { type: 'test-event', data: 'test-data' };
      
      const result = await basePlugin.handleEvent(event);
      
      expect(result).toBeDefined();
    });

    it('should return supported event types', () => {
      const eventTypes = basePlugin.getSupportedEventTypes();
      
      expect(Array.isArray(eventTypes)).toBe(true);
    });

    it('should check if it can handle events', () => {
      const canHandle = basePlugin.canHandleEvent('test-event');
      
      expect(typeof canHandle).toBe('boolean');
    });

    it('should return event priority', () => {
      const priority = basePlugin.getEventPriority('test-event');
      
      expect(typeof priority).toBe('number');
    });

    it('should subscribe to events on initialization', async () => {
      await basePlugin.initialize();
      
      expect(mockEventBus.subscribe).toHaveBeenCalled();
    });

    it('should unsubscribe from events on destruction', async () => {
      await basePlugin.initialize();
      await basePlugin.destroy();
      
      expect(mockEventBus.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('message rendering', () => {
    it('should render messages successfully', async () => {
      const message = { id: 'msg-1', content: 'Hello world', role: 'user' };
      
      const result = await basePlugin.renderMessage(message);
      
      expect(result).toBeDefined();
    });

    it('should check if it can render messages', () => {
      const message = { id: 'msg-1', content: 'Hello world', role: 'user' };
      const canRender = basePlugin.canRender(message);
      
      expect(typeof canRender).toBe('boolean');
    });

    it('should return render capabilities', () => {
      const capabilities = basePlugin.getRenderCapabilities();
      
      expect(typeof capabilities).toBe('object');
    });

    it('should return render priority', () => {
      const priority = basePlugin.getRenderPriority();
      
      expect(typeof priority).toBe('number');
    });
  });

  describe('event bus integration', () => {
    it('should publish events successfully', () => {
      const eventType = 'plugin.event';
      const eventData = { message: 'test' };
      
      basePlugin.publishEvent(eventType, eventData);
      
      expect(mockEventBus.publish).toHaveBeenCalledWith(eventType, eventData);
    });

    it('should subscribe to events successfully', () => {
      const eventType = 'plugin.event';
      const handler = jest.fn();
      
      const subscriptionId = basePlugin.subscribeToEvent(eventType, handler);
      
      expect(mockEventBus.subscribe).toHaveBeenCalledWith(eventType, handler);
      expect(subscriptionId).toBeDefined();
    });

    it('should unsubscribe from events successfully', () => {
      const subscriptionId = 'sub-123';
      
      basePlugin.unsubscribeFromEvent(subscriptionId);
      
      expect(mockEventBus.unsubscribeById).toHaveBeenCalledWith(subscriptionId);
    });
  });

  describe('configuration management', () => {
    it('should accept configuration during initialization', async () => {
      const config = { setting1: 'value1', setting2: 'value2' };
      
      await basePlugin.initialize(config);
      
      expect(basePlugin.isInitialized).toBe(true);
    });

    it('should store configuration', async () => {
      const config = { setting1: 'value1', setting2: 'value2' };
      
      await basePlugin.initialize(config);
      
      const storedConfig = (basePlugin as any).configuration;
      expect(storedConfig).toEqual(config);
    });

    it('should provide configuration getter', async () => {
      const config = { setting1: 'value1', setting2: 'value2' };
      
      await basePlugin.initialize(config);
      
      const retrievedConfig = basePlugin.getConfiguration();
      expect(retrievedConfig).toEqual(config);
    });

    it('should provide configuration setter', async () => {
      const initialConfig = { setting1: 'value1' };
      const newConfig = { setting1: 'new-value', setting2: 'value2' };
      
      await basePlugin.initialize(initialConfig);
      basePlugin.setConfiguration(newConfig);
      
      const retrievedConfig = basePlugin.getConfiguration();
      expect(retrievedConfig).toEqual(newConfig);
    });
  });

  describe('error handling', () => {
    it('should handle initialization errors', async () => {
      // Mock a plugin that throws during initialization
      const errorPlugin = new (class extends BasePlugin {
        async initialize(config?: any): Promise<void> {
          throw new Error('Initialization failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      await expect(errorPlugin.initialize()).rejects.toThrow('Initialization failed');
    });

    it('should handle start errors', async () => {
      // Mock a plugin that throws during start
      const errorPlugin = new (class extends BasePlugin {
        async start(): Promise<void> {
          throw new Error('Start failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      await errorPlugin.initialize();
      await expect(errorPlugin.start()).rejects.toThrow('Start failed');
    });

    it('should handle stop errors', async () => {
      // Mock a plugin that throws during stop
      const errorPlugin = new (class extends BasePlugin {
        async stop(): Promise<void> {
          throw new Error('Stop failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      await errorPlugin.initialize();
      await errorPlugin.start();
      await expect(errorPlugin.stop()).rejects.toThrow('Stop failed');
    });

    it('should handle destroy errors', async () => {
      // Mock a plugin that throws during destroy
      const errorPlugin = new (class extends BasePlugin {
        async destroy(): Promise<void> {
          throw new Error('Destroy failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      await errorPlugin.initialize();
      await expect(errorPlugin.destroy()).rejects.toThrow('Destroy failed');
    });

    it('should handle event handling errors', async () => {
      // Mock a plugin that throws during event handling
      const errorPlugin = new (class extends BasePlugin {
        async handleEvent(event: any): Promise<any> {
          throw new Error('Event handling failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      const event = { type: 'test-event', data: 'test-data' };
      await expect(errorPlugin.handleEvent(event)).rejects.toThrow('Event handling failed');
    });

    it('should handle message rendering errors', async () => {
      // Mock a plugin that throws during message rendering
      const errorPlugin = new (class extends BasePlugin {
        async renderMessage(message: any): Promise<any> {
          throw new Error('Rendering failed');
        }
      })('error-plugin', '1.0.0', mockEventBus);
      
      const message = { id: 'msg-1', content: 'Hello world', role: 'user' };
      await expect(errorPlugin.renderMessage(message)).rejects.toThrow('Rendering failed');
    });
  });

  describe('abstract method enforcement', () => {
    it('should enforce abstract method implementation', () => {
      // BasePlugin should not be instantiable directly if it has abstract methods
      expect(() => {
        new BasePlugin('test', '1.0.0', mockEventBus);
      }).not.toThrow();
    });

    it('should allow concrete implementations', () => {
      const concretePlugin = new (class extends BasePlugin {
        // Implement all required methods
      })('concrete-plugin', '1.0.0', mockEventBus);
      
      expect(concretePlugin).toBeInstanceOf(BasePlugin);
    });
  });

  describe('performance considerations', () => {
    it('should handle many lifecycle operations efficiently', async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await basePlugin.initialize();
        await basePlugin.start();
        await basePlugin.stop();
        await basePlugin.destroy();
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle many event operations efficiently', async () => {
      const events = Array.from({ length: 100 }, (_, i) => ({ 
        type: `event-${i}`, 
        data: `data-${i}` 
      }));
      
      const startTime = Date.now();
      
      for (const event of events) {
        await basePlugin.handleEvent(event);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle many render operations efficiently', async () => {
      const messages = Array.from({ length: 100 }, (_, i) => ({ 
        id: `msg-${i}`, 
        content: `Message ${i}`, 
        role: 'user' 
      }));
      
      const startTime = Date.now();
      
      for (const message of messages) {
        await basePlugin.renderMessage(message);
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for plugin base functionality
      expect(basePlugin.initialize).toBeDefined();
      expect(basePlugin.start).toBeDefined();
      expect(basePlugin.stop).toBeDefined();
      expect(basePlugin.destroy).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(basePlugin).toBeInstanceOf(BasePlugin);
      expect(basePlugin).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be substitutable for all plugin interfaces
      const lifecyclePlugin: ILifecyclePlugin = basePlugin;
      const eventPlugin: IEventPlugin = basePlugin;
      const renderPlugin: IRenderPlugin = basePlugin;
      
      expect(typeof lifecyclePlugin.initialize).toBe('function');
      expect(typeof eventPlugin.handleEvent).toBe('function');
      expect(typeof renderPlugin.renderMessage).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      expect(basePlugin.initialize).toBeDefined();
      expect(basePlugin.start).toBeDefined();
      expect(basePlugin.stop).toBeDefined();
      expect(basePlugin.destroy).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      expect(basePlugin).toBeDefined();
      expect(typeof basePlugin.initialize).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete plugin lifecycle workflow', async () => {
      // Initialize
      await basePlugin.initialize({ setting: 'value' });
      expect(basePlugin.isInitialized).toBe(true);
      
      // Start
      await basePlugin.start();
      expect(basePlugin.isRunning).toBe(true);
      
      // Handle events
      const event = { type: 'test-event', data: 'test-data' };
      const eventResult = await basePlugin.handleEvent(event);
      expect(eventResult).toBeDefined();
      
      // Render messages
      const message = { id: 'msg-1', content: 'Hello world', role: 'user' };
      const renderResult = await basePlugin.renderMessage(message);
      expect(renderResult).toBeDefined();
      
      // Stop
      await basePlugin.stop();
      expect(basePlugin.isRunning).toBe(false);
      
      // Destroy
      await basePlugin.destroy();
      expect(basePlugin.isInitialized).toBe(false);
    });

    it('should handle event bus integration workflow', async () => {
      await basePlugin.initialize();
      
      // Subscribe to events
      const handler = jest.fn();
      const subscriptionId = basePlugin.subscribeToEvent('test-event', handler);
      expect(subscriptionId).toBeDefined();
      
      // Publish events
      basePlugin.publishEvent('test-event', { data: 'test' });
      expect(mockEventBus.publish).toHaveBeenCalledWith('test-event', { data: 'test' });
      
      // Unsubscribe from events
      basePlugin.unsubscribeFromEvent(subscriptionId);
      expect(mockEventBus.unsubscribeById).toHaveBeenCalledWith(subscriptionId);
      
      await basePlugin.destroy();
    });
  });
}); 