import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { MessageEvent } from '../../../../src/features/concurrent-chat/core/types/events';
import { BasePlugin } from '../../../../src/features/concurrent-chat/plugins/BasePlugin';
import { PluginManager } from '../../../../src/features/concurrent-chat/plugins/PluginManager';

describe('PluginManager', () => {
  let pluginManager: PluginManager;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockServiceContainer: jest.Mocked<ServiceContainer>;
  let mockPlugin: jest.Mocked<BasePlugin>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn().mockReturnValue('sub-123'),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
      clearHistory: jest.fn(),
      getEventTypes: jest.fn(),
      getSubscriberCount: jest.fn(),
    } as any;

    mockServiceContainer = {
      register: jest.fn(),
      registerFactory: jest.fn(),
      get: jest.fn(),
    } as any;

    mockPlugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      init: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      isActive: jest.fn().mockReturnValue(false),
      getState: jest.fn().mockReturnValue('initialized'),
      getMetadata: jest.fn().mockReturnValue({
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        state: 'initialized',
        active: false,
      }),
    } as any;

    pluginManager = new PluginManager(mockEventBus, mockServiceContainer);
  });

  describe('manager creation', () => {
    it('should create plugin manager instance', () => {
      expect(pluginManager).toBeInstanceOf(PluginManager);
    });

    it('should store event bus and container references', () => {
      const eventBus = (pluginManager as any).eventBus;
      const container = (pluginManager as any).container;
      expect(eventBus).toBe(mockEventBus);
      expect(container).toBe(mockServiceContainer);
    });

    it('should initialize with empty plugin registry', () => {
      const plugins = (pluginManager as any).plugins;
      expect(plugins).toBeInstanceOf(Map);
      expect(plugins.size).toBe(0);
    });
  });

  describe('plugin registration', () => {
    it('should register plugin successfully', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
    });

    it('should handle duplicate plugin registration', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await expect(pluginManager.registerPlugin(mockPlugin)).rejects.toThrow(
        "Plugin with ID 'test-plugin' is already registered"
      );
    });

    it('should register event plugin correctly', async () => {
      const eventPlugin = {
        ...mockPlugin,
        handleEvent: jest.fn().mockResolvedValue(undefined),
        getEventTypes: jest.fn().mockReturnValue(['test-event']),
        canHandleEvent: jest.fn().mockReturnValue(true),
        getEventPriority: jest.fn().mockReturnValue(1),
      } as any;

      await pluginManager.registerPlugin(eventPlugin);
      
      expect(pluginManager.getEventPlugins()).toHaveLength(1);
      expect(pluginManager.getEventPlugins()[0]).toBe(eventPlugin);
    });

    it('should register render plugin correctly', async () => {
      const renderPlugin = {
        ...mockPlugin,
        render: jest.fn().mockReturnValue(null),
        canRender: jest.fn().mockReturnValue(true),
        getRenderPriority: jest.fn().mockReturnValue(1),
        getComponentType: jest.fn().mockReturnValue('test-component'),
        shouldOverride: jest.fn().mockReturnValue(false),
      } as any;

      await pluginManager.registerPlugin(renderPlugin);
      
      expect(pluginManager.getRenderPlugins()).toHaveLength(1);
      expect(pluginManager.getRenderPlugins()[0]).toBe(renderPlugin);
    });

    it('should register lifecycle plugin correctly', async () => {
      const lifecyclePlugin = {
        ...mockPlugin,
        start: jest.fn().mockResolvedValue(undefined),
        stop: jest.fn().mockResolvedValue(undefined),
      } as any;

      await pluginManager.registerPlugin(lifecyclePlugin);
      
      expect(pluginManager.getLifecyclePlugins()).toHaveLength(1);
      expect(pluginManager.getLifecyclePlugins()[0]).toBe(lifecyclePlugin);
    });
  });

  describe('plugin unregistration', () => {
    it('should unregister plugin successfully', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.unregisterPlugin('test-plugin');
      
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should handle unregistering non-existent plugin', async () => {
      await expect(pluginManager.unregisterPlugin('non-existent')).rejects.toThrow(
        "Plugin with ID 'non-existent' is not registered"
      );
    });

    it('should destroy plugin on unregistration', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.unregisterPlugin('test-plugin');
      
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });
  });

  describe('plugin lifecycle management', () => {
    it('should initialize all plugins', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.initializePlugins();
      
      expect(mockPlugin.init).toHaveBeenCalled();
    });

    it('should start all plugins', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.startPlugins();
      
      expect(mockPlugin.start).toHaveBeenCalled();
    });

    it('should stop all plugins', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.stopPlugins();
      
      expect(mockPlugin.stop).toHaveBeenCalled();
    });

    it('should destroy all plugins', async () => {
      await pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.destroyPlugins();
      
      expect(mockPlugin.destroy).toHaveBeenCalled();
      expect(pluginManager.getAllPlugins()).toHaveLength(0);
    });
  });

  describe('event handling', () => {
    it('should handle events with event plugins', async () => {
      const eventPlugin = {
        ...mockPlugin,
        handleEvent: jest.fn().mockResolvedValue(undefined),
        getEventTypes: jest.fn().mockReturnValue(['test-event']),
        canHandleEvent: jest.fn().mockReturnValue(true),
        getEventPriority: jest.fn().mockReturnValue(1),
      } as any;

      await pluginManager.registerPlugin(eventPlugin);
      
      const testEvent: MessageEvent = {
        type: 'test-event',
        timestamp: Date.now(),
      } as any;

      await pluginManager.handleEvent(testEvent);
      
      expect(eventPlugin.handleEvent).toHaveBeenCalledWith(testEvent);
    });
  });

  describe('render plugin management', () => {
    it('should get render plugins for message', async () => {
      const renderPlugin = {
        ...mockPlugin,
        render: jest.fn().mockReturnValue(null),
        canRender: jest.fn().mockReturnValue(true),
        getRenderPriority: jest.fn().mockReturnValue(1),
        getComponentType: jest.fn().mockReturnValue('test-component'),
        shouldOverride: jest.fn().mockReturnValue(false),
      } as any;

      await pluginManager.registerPlugin(renderPlugin);
      
      const message = { id: 'test-message' };
      const renderPlugins = pluginManager.getRenderPluginsForMessage(message);
      
      expect(renderPlugins).toHaveLength(1);
      expect(renderPlugins[0]).toBe(renderPlugin);
    });
  });

  describe('plugin queries', () => {
    it('should check if plugin is registered', async () => {
      expect(pluginManager.isPluginRegistered('test-plugin')).toBe(false);
      
      await pluginManager.registerPlugin(mockPlugin);
      
      expect(pluginManager.isPluginRegistered('test-plugin')).toBe(true);
    });

    it('should get plugin statistics', async () => {
      const eventPlugin = {
        ...mockPlugin,
        id: 'event-plugin',
        handleEvent: jest.fn().mockResolvedValue(undefined),
        getEventTypes: jest.fn().mockReturnValue(['test-event']),
        canHandleEvent: jest.fn().mockReturnValue(true),
        getEventPriority: jest.fn().mockReturnValue(1),
      } as any;

      const renderPlugin = {
        ...mockPlugin,
        id: 'render-plugin',
        render: jest.fn().mockReturnValue(null),
        canRender: jest.fn().mockReturnValue(true),
        getRenderPriority: jest.fn().mockReturnValue(1),
        getComponentType: jest.fn().mockReturnValue('test-component'),
        shouldOverride: jest.fn().mockReturnValue(false),
      } as any;

      await pluginManager.registerPlugin(eventPlugin);
      await pluginManager.registerPlugin(renderPlugin);
      
      const stats = pluginManager.getPluginStats();
      
      expect(stats.total).toBe(2);
      expect(stats.eventPlugins).toBe(1);
      expect(stats.renderPlugins).toBe(1);
      expect(stats.lifecyclePlugins).toBe(2); // Both plugins implement lifecycle
    });
  });
}); 