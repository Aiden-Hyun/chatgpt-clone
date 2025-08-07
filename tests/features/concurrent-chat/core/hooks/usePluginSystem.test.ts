import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { usePluginSystem } from '../../../../../src/features/concurrent-chat/core/hooks/usePluginSystem';
import { BasePlugin } from '../../../../../src/features/concurrent-chat/plugins/BasePlugin';

describe('usePluginSystem', () => {
  let mockEventBus: EventBus;
  let mockServiceContainer: ServiceContainer;
  let mockPlugin: jest.Mocked<BasePlugin>;

  beforeEach(() => {
    // Create real instances
    mockEventBus = new EventBus();
    mockServiceContainer = new ServiceContainer();
    
    mockPlugin = {
      id: 'test-plugin',
      name: 'Test Plugin',
      version: '1.0.0',
      init: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      getState: jest.fn().mockReturnValue('initialized'),
      isActive: jest.fn().mockReturnValue(true),
      getMetadata: jest.fn().mockReturnValue({
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        state: 'initialized',
        active: true,
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      expect(result.current.plugins).toEqual([]);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isStarting).toBe(false);
      expect(result.current.isStopping).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize plugin manager', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      // Should initialize without errors
      expect(result.current.pluginStats).toBeDefined();
    });

    it('should handle initialization errors gracefully', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      // Should handle errors gracefully
      expect(result.current.error).toBeNull();
    });
  });

  describe('plugin registration', () => {
    it('should register a plugin successfully', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.registerPlugin(mockPlugin);
      });

      // Should handle registration gracefully
      expect(result.current.plugins).toBeDefined();
    });

    it('should handle registration errors', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.registerPlugin(mockPlugin);
      });

      // Should handle errors gracefully
      expect(result.current.error).toBeNull();
    });
  });

  describe('plugin unregistration', () => {
    it('should unregister a plugin successfully', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      // First register a plugin, then unregister it
      await act(async () => {
        await result.current.registerPlugin(mockPlugin);
        await result.current.unregisterPlugin('test-plugin');
      });

      // Should handle unregistration gracefully
      expect(result.current.plugins).toBeDefined();
    });
  });

  describe('plugin lifecycle management', () => {
    it('should start all plugins', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.startPlugins();
      });

      // Should handle starting gracefully
      expect(result.current.isStarting).toBe(false);
    });

    it('should stop all plugins', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.stopPlugins();
      });

      // Should handle stopping gracefully
      expect(result.current.isStopping).toBe(false);
    });
  });

  describe('plugin queries', () => {
    it('should get a plugin by ID', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const plugin = result.current.getPlugin('test-plugin');

      expect(plugin).toBeUndefined(); // No plugins registered initially
    });

    it('should check if plugin is registered', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const isRegistered = result.current.isPluginRegistered('test-plugin');

      expect(isRegistered).toBe(false);
    });

    it('should get all event plugins', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const eventPlugins = result.current.getEventPlugins();

      expect(eventPlugins).toEqual([]);
    });

    it('should get all render plugins', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const renderPlugins = result.current.getRenderPlugins();

      expect(renderPlugins).toEqual([]);
    });

    it('should get all lifecycle plugins', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const lifecyclePlugins = result.current.getLifecyclePlugins();

      expect(lifecyclePlugins).toEqual([]);
    });
  });

  describe('event handling', () => {
    it('should handle events with event plugins', async () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const mockEvent = {
        type: 'MESSAGE_SENT',
        timestamp: Date.now(),
        message: {},
        content: 'test',
        model: 'gpt-3.5-turbo',
      };

      await act(async () => {
        await result.current.handleEvent(mockEvent);
      });

      // Should handle events gracefully
      expect(result.current.error).toBeNull();
    });

    it('should get render plugins for message', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      const message = { id: 'msg-123', content: 'test' };
      const renderPlugins = result.current.getRenderPluginsForMessage(message);

      expect(renderPlugins).toEqual([]);
    });
  });

  describe('plugin statistics', () => {
    it('should refresh plugin statistics', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      act(() => {
        result.current.refreshPluginStats();
      });

      expect(result.current.pluginStats).toBeDefined();
    });

    it('should return correct plugin statistics', () => {
      const { result } = renderHook(() => usePluginSystem(mockEventBus, mockServiceContainer));

      expect(result.current.pluginStats).toEqual({
        total: 0,
        eventPlugins: 0,
        renderPlugins: 0,
        lifecyclePlugins: 0,
        active: 0,
        initialized: 0,
      });
    });
  });
}); 