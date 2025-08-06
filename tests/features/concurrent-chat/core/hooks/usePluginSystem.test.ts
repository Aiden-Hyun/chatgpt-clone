import { act, renderHook } from '@testing-library/react-hooks';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { usePluginSystem } from '../../../../../src/features/concurrent-chat/core/hooks/usePluginSystem';
import { BasePlugin } from '../../../../../src/features/concurrent-chat/plugins/BasePlugin';
import { PluginManager } from '../../../../../src/features/concurrent-chat/plugins/PluginManager';

describe('usePluginSystem', () => {
  let mockPluginManager: jest.Mocked<PluginManager>;
  let mockEventBus: jest.Mocked<EventBus>;
  let mockPlugin: jest.Mocked<BasePlugin>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;

    mockPluginManager = {
      registerPlugin: jest.fn(),
      unregisterPlugin: jest.fn(),
      getPlugin: jest.fn(),
      getAllPlugins: jest.fn(),
      initializeAllPlugins: jest.fn(),
      startAllPlugins: jest.fn(),
      stopAllPlugins: jest.fn(),
      destroyAllPlugins: jest.fn(),
      publishEventToPlugins: jest.fn(),
      getPluginCount: jest.fn(),
      hasPlugin: jest.fn(),
      getPluginConfiguration: jest.fn(),
      setPluginConfiguration: jest.fn(),
      resolveDependencies: jest.fn(),
      reloadPlugin: jest.fn(),
      checkInterfaceCompliance: jest.fn(),
      checkLifecycleCompliance: jest.fn(),
      checkEventCompliance: jest.fn(),
      checkRenderCompliance: jest.fn(),
    } as any;

    mockPlugin = {
      pluginId: 'test-plugin',
      version: '1.0.0',
      isInitialized: false,
      isRunning: false,
      initialize: jest.fn().mockResolvedValue(undefined),
      start: jest.fn().mockResolvedValue(undefined),
      stop: jest.fn().mockResolvedValue(undefined),
      destroy: jest.fn().mockResolvedValue(undefined),
      handleEvent: jest.fn().mockResolvedValue({}),
      getSupportedEventTypes: jest.fn().mockReturnValue(['test-event']),
      canHandleEvent: jest.fn().mockReturnValue(true),
      getEventPriority: jest.fn().mockReturnValue(1),
      renderMessage: jest.fn().mockResolvedValue({}),
      canRender: jest.fn().mockReturnValue(true),
      getRenderCapabilities: jest.fn().mockReturnValue({}),
      getRenderPriority: jest.fn().mockReturnValue(1),
      publishEvent: jest.fn(),
      subscribeToEvent: jest.fn().mockReturnValue('sub-123'),
      unsubscribeFromEvent: jest.fn(),
      getConfiguration: jest.fn().mockReturnValue({}),
      setConfiguration: jest.fn(),
    } as any;
  });

  describe('hook initialization', () => {
    it('should initialize with empty plugin state', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      expect(result.current.plugins).toEqual([]);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should initialize with provided dependencies', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      expect(result.current.pluginManager).toBe(mockPluginManager);
      expect(result.current.eventBus).toBe(mockEventBus);
    });

    it('should initialize plugin system', () => {
      renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      expect(mockPluginManager.initializeAllPlugins).toHaveBeenCalled();
    });

    it('should subscribe to plugin events', () => {
      renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      expect(mockEventBus.subscribe).toHaveBeenCalled();
    });
  });

  describe('plugin registration', () => {
    it('should register plugin successfully', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const registrationResult = await result.current.registerPlugin(mockPlugin);
        expect(registrationResult).toBe(true);
      });

      expect(mockPluginManager.registerPlugin).toHaveBeenCalledWith(mockPlugin);
    });

    it('should register plugin with configuration', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      const config = { setting1: 'value1', setting2: 'value2' };

      await act(async () => {
        const registrationResult = await result.current.registerPlugin(mockPlugin, config);
        expect(registrationResult).toBe(true);
      });

      expect(mockPluginManager.registerPlugin).toHaveBeenCalledWith(mockPlugin, config);
    });

    it('should handle registration errors', async () => {
      mockPluginManager.registerPlugin.mockReturnValue(false);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const registrationResult = await result.current.registerPlugin(mockPlugin);
        expect(registrationResult).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should handle null plugin registration', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const registrationResult = await result.current.registerPlugin(null as any);
        expect(registrationResult).toBe(false);
      });
    });
  });

  describe('plugin unregistration', () => {
    it('should unregister plugin successfully', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const unregistrationResult = await result.current.unregisterPlugin('test-plugin');
        expect(unregistrationResult).toBe(true);
      });

      expect(mockPluginManager.unregisterPlugin).toHaveBeenCalledWith('test-plugin');
    });

    it('should handle unregistration errors', async () => {
      mockPluginManager.unregisterPlugin.mockResolvedValue(false);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const unregistrationResult = await result.current.unregisterPlugin('test-plugin');
        expect(unregistrationResult).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('plugin lifecycle management', () => {
    it('should start all plugins', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.startAllPlugins();
      });

      expect(mockPluginManager.startAllPlugins).toHaveBeenCalled();
      expect(result.current.isInitialized).toBe(true);
    });

    it('should stop all plugins', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.stopAllPlugins();
      });

      expect(mockPluginManager.stopAllPlugins).toHaveBeenCalled();
    });

    it('should destroy all plugins', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.destroyAllPlugins();
      });

      expect(mockPluginManager.destroyAllPlugins).toHaveBeenCalled();
    });

    it('should handle lifecycle errors', async () => {
      mockPluginManager.startAllPlugins.mockRejectedValue(new Error('Start failed'));
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.startAllPlugins();
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('plugin querying', () => {
    it('should get plugin by ID', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const plugin = result.current.getPlugin('test-plugin');
        expect(plugin).toBe(mockPlugin);
      });

      expect(mockPluginManager.getPlugin).toHaveBeenCalledWith('test-plugin');
    });

    it('should get all plugins', () => {
      mockPluginManager.getAllPlugins.mockReturnValue([mockPlugin]);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const plugins = result.current.getAllPlugins();
        expect(plugins).toEqual([mockPlugin]);
      });
    });

    it('should get plugin count', () => {
      mockPluginManager.getPluginCount.mockReturnValue(5);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const count = result.current.getPluginCount();
        expect(count).toBe(5);
      });
    });

    it('should check if plugin exists', () => {
      mockPluginManager.hasPlugin.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const exists = result.current.hasPlugin('test-plugin');
        expect(exists).toBe(true);
      });
    });
  });

  describe('plugin configuration management', () => {
    it('should get plugin configuration', () => {
      const config = { setting1: 'value1' };
      mockPluginManager.getPluginConfiguration.mockReturnValue(config);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const retrievedConfig = result.current.getPluginConfiguration('test-plugin');
        expect(retrievedConfig).toEqual(config);
      });
    });

    it('should set plugin configuration', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      const newConfig = { setting1: 'new-value' };

      act(() => {
        result.current.setPluginConfiguration('test-plugin', newConfig);
      });

      expect(mockPluginManager.setPluginConfiguration).toHaveBeenCalledWith('test-plugin', newConfig);
    });
  });

  describe('plugin dependency resolution', () => {
    it('should resolve plugin dependencies', () => {
      mockPluginManager.resolveDependencies.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const resolved = result.current.resolveDependencies();
        expect(resolved).toBe(true);
      });
    });

    it('should handle dependency resolution errors', () => {
      mockPluginManager.resolveDependencies.mockReturnValue(false);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const resolved = result.current.resolveDependencies();
        expect(resolved).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('plugin hot reloading', () => {
    it('should reload plugin successfully', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const reloadResult = await result.current.reloadPlugin('test-plugin');
        expect(reloadResult).toBe(true);
      });

      expect(mockPluginManager.reloadPlugin).toHaveBeenCalledWith('test-plugin');
    });

    it('should handle reload errors', async () => {
      mockPluginManager.reloadPlugin.mockResolvedValue(false);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      await act(async () => {
        const reloadResult = await result.current.reloadPlugin('test-plugin');
        expect(reloadResult).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('plugin interface compliance', () => {
    it('should check interface compliance', () => {
      mockPluginManager.checkInterfaceCompliance.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const compliant = result.current.checkInterfaceCompliance(mockPlugin);
        expect(compliant).toBe(true);
      });
    });

    it('should check lifecycle compliance', () => {
      mockPluginManager.checkLifecycleCompliance.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const compliant = result.current.checkLifecycleCompliance(mockPlugin);
        expect(compliant).toBe(true);
      });
    });

    it('should check event compliance', () => {
      mockPluginManager.checkEventCompliance.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const compliant = result.current.checkEventCompliance(mockPlugin);
        expect(compliant).toBe(true);
      });
    });

    it('should check render compliance', () => {
      mockPluginManager.checkRenderCompliance.mockReturnValue(true);
      
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const compliant = result.current.checkRenderCompliance(mockPlugin);
        expect(compliant).toBe(true);
      });
    });
  });

  describe('plugin communication', () => {
    it('should publish events to plugins', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.publishEventToPlugins('test-event', { data: 'test' });
      });

      expect(mockPluginManager.publishEventToPlugins).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should handle plugin-to-plugin communication', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.handlePluginCommunication('plugin1', 'plugin2', { message: 'hello' });
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.communication', {
        from: 'plugin1',
        to: 'plugin2',
        data: { message: 'hello' }
      });
    });
  });

  describe('plugin state management', () => {
    it('should update plugin state', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.updatePluginState('test-plugin', { isActive: true });
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.state.updated', {
        pluginId: 'test-plugin',
        state: { isActive: true }
      });
    });

    it('should get plugin state', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const state = result.current.getPluginState('test-plugin');
        expect(state).toBeDefined();
      });
    });

    it('should handle plugin state changes', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.handlePluginStateChange('test-plugin', { isRunning: true });
      });

      expect(result.current.plugins).toBeDefined();
    });
  });

  describe('plugin performance monitoring', () => {
    it('should monitor plugin performance', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.monitorPluginPerformance('test-plugin');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.performance.monitor', {
        pluginId: 'test-plugin'
      });
    });

    it('should get plugin performance metrics', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const metrics = result.current.getPluginPerformanceMetrics('test-plugin');
        expect(metrics).toBeDefined();
      });
    });

    it('should handle performance alerts', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.handlePerformanceAlert('test-plugin', { cpu: 90, memory: 80 });
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('plugin error handling', () => {
    it('should handle plugin errors', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.handlePluginError('test-plugin', new Error('Plugin error'));
      });

      expect(result.current.error).toBeDefined();
    });

    it('should isolate plugin errors', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.isolatePluginError('test-plugin');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.error.isolated', {
        pluginId: 'test-plugin'
      });
    });

    it('should recover from plugin errors', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.recoverFromPluginError('test-plugin');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.error.recovered', {
        pluginId: 'test-plugin'
      });
    });
  });

  describe('plugin security', () => {
    it('should validate plugin security', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        const isValid = result.current.validatePluginSecurity(mockPlugin);
        expect(isValid).toBeDefined();
      });
    });

    it('should handle security violations', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.handleSecurityViolation('test-plugin', 'unauthorized_access');
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('performance considerations', () => {
    it('should handle many plugins efficiently', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => {
          const plugin = { ...mockPlugin, pluginId: `plugin-${i}` };
          return result.current.registerPlugin(plugin);
        });
        await Promise.all(promises);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle plugin operations efficiently', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      const startTime = Date.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.hasPlugin(`plugin-${i}`);
        }
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('cleanup and unmounting', () => {
    it('should cleanup on unmount', () => {
      const { result, unmount } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      unmount();

      expect(mockEventBus.unsubscribe).toHaveBeenCalled();
      expect(mockPluginManager.destroyAllPlugins).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockPluginManager.destroyAllPlugins.mockRejectedValue(new Error('Cleanup failed'));

      const { unmount } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete plugin lifecycle workflow', async () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      // Register plugin
      await act(async () => {
        const registered = await result.current.registerPlugin(mockPlugin);
        expect(registered).toBe(true);
      });

      // Start plugins
      await act(async () => {
        await result.current.startAllPlugins();
      });

      expect(result.current.isInitialized).toBe(true);

      // Publish event to plugins
      act(() => {
        result.current.publishEventToPlugins('test-event', { data: 'test' });
      });

      expect(mockPluginManager.publishEventToPlugins).toHaveBeenCalled();

      // Stop plugins
      await act(async () => {
        await result.current.stopAllPlugins();
      });

      // Unregister plugin
      await act(async () => {
        const unregistered = await result.current.unregisterPlugin('test-plugin');
        expect(unregistered).toBe(true);
      });
    });

    it('should handle plugin communication workflow', () => {
      const { result } = renderHook(() => usePluginSystem({
        pluginManager: mockPluginManager,
        eventBus: mockEventBus
      }));

      // Handle plugin communication
      act(() => {
        result.current.handlePluginCommunication('sender', 'receiver', { message: 'hello' });
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.communication', {
        from: 'sender',
        to: 'receiver',
        data: { message: 'hello' }
      });

      // Handle plugin state change
      act(() => {
        result.current.handlePluginStateChange('test-plugin', { isActive: true });
      });

      // Monitor performance
      act(() => {
        result.current.monitorPluginPerformance('test-plugin');
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('plugin.performance.monitor', {
        pluginId: 'test-plugin'
      });
    });
  });
}); 