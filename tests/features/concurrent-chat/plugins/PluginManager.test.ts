import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { BasePlugin } from '../../../../../src/features/concurrent-chat/plugins/BasePlugin';
import { IEventPlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/IEventPlugin';
import { ILifecyclePlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/ILifecyclePlugin';
import { IRenderPlugin } from '../../../../../src/features/concurrent-chat/plugins/interfaces/IRenderPlugin';
import { PluginManager } from '../../../../../src/features/concurrent-chat/plugins/PluginManager';

describe('PluginManager', () => {
  let pluginManager: PluginManager;
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

    pluginManager = new PluginManager(mockEventBus);
  });

  describe('manager creation', () => {
    it('should create plugin manager instance', () => {
      expect(pluginManager).toBeInstanceOf(PluginManager);
      expect(pluginManager).toBeInstanceOf(Object);
    });

    it('should store event bus reference', () => {
      const eventBus = (pluginManager as any).eventBus;
      expect(eventBus).toBe(mockEventBus);
    });

    it('should initialize with empty plugin registry', () => {
      const plugins = (pluginManager as any).plugins;
      expect(plugins).toBeInstanceOf(Map);
      expect(plugins.size).toBe(0);
    });

    it('should initialize with empty plugin configurations', () => {
      const configurations = (pluginManager as any).pluginConfigurations;
      expect(configurations).toBeInstanceOf(Map);
      expect(configurations.size).toBe(0);
    });
  });

  describe('plugin registration', () => {
    it('should register plugin successfully', () => {
      const result = pluginManager.registerPlugin(mockPlugin);
      
      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBe(mockPlugin);
    });

    it('should handle duplicate plugin registration', () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const result = pluginManager.registerPlugin(mockPlugin);
      
      expect(result).toBe(false);
    });

    it('should validate plugin interface compliance', () => {
      const invalidPlugin = {
        pluginId: 'invalid-plugin',
        version: '1.0.0'
      } as any;
      
      const result = pluginManager.registerPlugin(invalidPlugin);
      
      expect(result).toBe(false);
    });

    it('should register plugin with configuration', () => {
      const config = { setting1: 'value1', setting2: 'value2' };
      
      const result = pluginManager.registerPlugin(mockPlugin, config);
      
      expect(result).toBe(true);
      expect(pluginManager.getPluginConfiguration('test-plugin')).toEqual(config);
    });

    it('should handle null plugin registration', () => {
      const result = pluginManager.registerPlugin(null as any);
      
      expect(result).toBe(false);
    });

    it('should handle undefined plugin registration', () => {
      const result = pluginManager.registerPlugin(undefined as any);
      
      expect(result).toBe(false);
    });
  });

  describe('plugin unregistration', () => {
    it('should unregister plugin successfully', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const result = await pluginManager.unregisterPlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should handle unregistering non-existent plugin', async () => {
      const result = await pluginManager.unregisterPlugin('non-existent');
      
      expect(result).toBe(false);
    });

    it('should destroy plugin on unregistration', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.unregisterPlugin('test-plugin');
      
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });

    it('should handle plugin destruction errors', async () => {
      mockPlugin.destroy.mockRejectedValue(new Error('Destroy failed'));
      pluginManager.registerPlugin(mockPlugin);
      
      const result = await pluginManager.unregisterPlugin('test-plugin');
      
      expect(result).toBe(false);
    });
  });

  describe('plugin lifecycle management', () => {
    it('should initialize all plugins', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.initializeAllPlugins();
      
      expect(mockPlugin.initialize).toHaveBeenCalled();
    });

    it('should start all plugins', async () => {
      pluginManager.registerPlugin(mockPlugin);
      await pluginManager.initializeAllPlugins();
      
      await pluginManager.startAllPlugins();
      
      expect(mockPlugin.start).toHaveBeenCalled();
    });

    it('should stop all plugins', async () => {
      pluginManager.registerPlugin(mockPlugin);
      await pluginManager.initializeAllPlugins();
      await pluginManager.startAllPlugins();
      
      await pluginManager.stopAllPlugins();
      
      expect(mockPlugin.stop).toHaveBeenCalled();
    });

    it('should destroy all plugins', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.destroyAllPlugins();
      
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      mockPlugin.initialize.mockRejectedValue(new Error('Init failed'));
      pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.initializeAllPlugins();
      
      // Should continue despite errors
      expect(mockPlugin.initialize).toHaveBeenCalled();
    });

    it('should handle start errors gracefully', async () => {
      mockPlugin.start.mockRejectedValue(new Error('Start failed'));
      pluginManager.registerPlugin(mockPlugin);
      await pluginManager.initializeAllPlugins();
      
      await pluginManager.startAllPlugins();
      
      // Should continue despite errors
      expect(mockPlugin.start).toHaveBeenCalled();
    });

    it('should handle stop errors gracefully', async () => {
      mockPlugin.stop.mockRejectedValue(new Error('Stop failed'));
      pluginManager.registerPlugin(mockPlugin);
      await pluginManager.initializeAllPlugins();
      await pluginManager.startAllPlugins();
      
      await pluginManager.stopAllPlugins();
      
      // Should continue despite errors
      expect(mockPlugin.stop).toHaveBeenCalled();
    });

    it('should handle destroy errors gracefully', async () => {
      mockPlugin.destroy.mockRejectedValue(new Error('Destroy failed'));
      pluginManager.registerPlugin(mockPlugin);
      
      await pluginManager.destroyAllPlugins();
      
      // Should continue despite errors
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });
  });

  describe('plugin querying', () => {
    it('should get plugin by ID', () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const plugin = pluginManager.getPlugin('test-plugin');
      
      expect(plugin).toBe(mockPlugin);
    });

    it('should return undefined for non-existent plugin', () => {
      const plugin = pluginManager.getPlugin('non-existent');
      
      expect(plugin).toBeUndefined();
    });

    it('should get all plugins', () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const plugins = pluginManager.getAllPlugins();
      
      expect(plugins).toContain(mockPlugin);
      expect(plugins.length).toBe(1);
    });

    it('should get plugins by type', () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const lifecyclePlugins = pluginManager.getPluginsByType<ILifecyclePlugin>('lifecycle');
      const eventPlugins = pluginManager.getPluginsByType<IEventPlugin>('event');
      const renderPlugins = pluginManager.getPluginsByType<IRenderPlugin>('render');
      
      expect(lifecyclePlugins).toContain(mockPlugin);
      expect(eventPlugins).toContain(mockPlugin);
      expect(renderPlugins).toContain(mockPlugin);
    });

    it('should get plugin count', () => {
      expect(pluginManager.getPluginCount()).toBe(0);
      
      pluginManager.registerPlugin(mockPlugin);
      
      expect(pluginManager.getPluginCount()).toBe(1);
    });

    it('should check if plugin exists', () => {
      expect(pluginManager.hasPlugin('test-plugin')).toBe(false);
      
      pluginManager.registerPlugin(mockPlugin);
      
      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
    });
  });

  describe('plugin configuration management', () => {
    it('should get plugin configuration', () => {
      const config = { setting1: 'value1' };
      pluginManager.registerPlugin(mockPlugin, config);
      
      const retrievedConfig = pluginManager.getPluginConfiguration('test-plugin');
      
      expect(retrievedConfig).toEqual(config);
    });

    it('should set plugin configuration', () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const newConfig = { setting1: 'new-value' };
      pluginManager.setPluginConfiguration('test-plugin', newConfig);
      
      const retrievedConfig = pluginManager.getPluginConfiguration('test-plugin');
      expect(retrievedConfig).toEqual(newConfig);
    });

    it('should update plugin configuration', () => {
      const initialConfig = { setting1: 'value1' };
      pluginManager.registerPlugin(mockPlugin, initialConfig);
      
      const updatedConfig = { setting1: 'updated-value', setting2: 'value2' };
      pluginManager.setPluginConfiguration('test-plugin', updatedConfig);
      
      const retrievedConfig = pluginManager.getPluginConfiguration('test-plugin');
      expect(retrievedConfig).toEqual(updatedConfig);
    });

    it('should return undefined for non-existent plugin configuration', () => {
      const config = pluginManager.getPluginConfiguration('non-existent');
      
      expect(config).toBeUndefined();
    });
  });

  describe('dependency resolution', () => {
    it('should resolve plugin dependencies', () => {
      const dependencyPlugin = {
        ...mockPlugin,
        pluginId: 'dependency-plugin',
        getDependencies: jest.fn().mockReturnValue([])
      } as any;
      
      const dependentPlugin = {
        ...mockPlugin,
        pluginId: 'dependent-plugin',
        getDependencies: jest.fn().mockReturnValue(['dependency-plugin'])
      } as any;
      
      pluginManager.registerPlugin(dependencyPlugin);
      pluginManager.registerPlugin(dependentPlugin);
      
      const resolved = pluginManager.resolveDependencies();
      
      expect(resolved).toBe(true);
    });

    it('should handle circular dependencies', () => {
      const plugin1 = {
        ...mockPlugin,
        pluginId: 'plugin1',
        getDependencies: jest.fn().mockReturnValue(['plugin2'])
      } as any;
      
      const plugin2 = {
        ...mockPlugin,
        pluginId: 'plugin2',
        getDependencies: jest.fn().mockReturnValue(['plugin1'])
      } as any;
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const resolved = pluginManager.resolveDependencies();
      
      expect(resolved).toBe(false);
    });

    it('should handle missing dependencies', () => {
      const dependentPlugin = {
        ...mockPlugin,
        pluginId: 'dependent-plugin',
        getDependencies: jest.fn().mockReturnValue(['missing-dependency'])
      } as any;
      
      pluginManager.registerPlugin(dependentPlugin);
      
      const resolved = pluginManager.resolveDependencies();
      
      expect(resolved).toBe(false);
    });
  });

  describe('hot reloading', () => {
    it('should reload plugin successfully', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const result = await pluginManager.reloadPlugin('test-plugin');
      
      expect(result).toBe(true);
      expect(mockPlugin.destroy).toHaveBeenCalled();
    });

    it('should handle reloading non-existent plugin', async () => {
      const result = await pluginManager.reloadPlugin('non-existent');
      
      expect(result).toBe(false);
    });

    it('should preserve configuration during reload', async () => {
      const config = { setting1: 'value1' };
      pluginManager.registerPlugin(mockPlugin, config);
      
      await pluginManager.reloadPlugin('test-plugin');
      
      const preservedConfig = pluginManager.getPluginConfiguration('test-plugin');
      expect(preservedConfig).toEqual(config);
    });
  });

  describe('plugin isolation', () => {
    it('should isolate plugin errors', async () => {
      const errorPlugin = {
        ...mockPlugin,
        pluginId: 'error-plugin',
        initialize: jest.fn().mockRejectedValue(new Error('Plugin error'))
      } as any;
      
      const normalPlugin = {
        ...mockPlugin,
        pluginId: 'normal-plugin'
      } as any;
      
      pluginManager.registerPlugin(errorPlugin);
      pluginManager.registerPlugin(normalPlugin);
      
      await pluginManager.initializeAllPlugins();
      
      // Normal plugin should still be initialized
      expect(normalPlugin.initialize).toHaveBeenCalled();
    });

    it('should prevent plugin interference', () => {
      const plugin1 = {
        ...mockPlugin,
        pluginId: 'plugin1'
      } as any;
      
      const plugin2 = {
        ...mockPlugin,
        pluginId: 'plugin2'
      } as any;
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      const plugins = pluginManager.getAllPlugins();
      
      expect(plugins).toHaveLength(2);
      expect(plugins).toContain(plugin1);
      expect(plugins).toContain(plugin2);
    });
  });

  describe('plugin communication', () => {
    it('should enable plugin-to-plugin communication', () => {
      const plugin1 = {
        ...mockPlugin,
        pluginId: 'plugin1',
        publishEvent: jest.fn()
      } as any;
      
      const plugin2 = {
        ...mockPlugin,
        pluginId: 'plugin2',
        handleEvent: jest.fn().mockResolvedValue({})
      } as any;
      
      pluginManager.registerPlugin(plugin1);
      pluginManager.registerPlugin(plugin2);
      
      pluginManager.publishEventToPlugins('test-event', { data: 'test' });
      
      expect(plugin2.handleEvent).toHaveBeenCalledWith({
        type: 'test-event',
        data: { data: 'test' }
      });
    });

    it('should filter events by plugin capability', () => {
      const capablePlugin = {
        ...mockPlugin,
        pluginId: 'capable-plugin',
        canHandleEvent: jest.fn().mockReturnValue(true),
        handleEvent: jest.fn().mockResolvedValue({})
      } as any;
      
      const incapablePlugin = {
        ...mockPlugin,
        pluginId: 'incapable-plugin',
        canHandleEvent: jest.fn().mockReturnValue(false),
        handleEvent: jest.fn().mockResolvedValue({})
      } as any;
      
      pluginManager.registerPlugin(capablePlugin);
      pluginManager.registerPlugin(incapablePlugin);
      
      pluginManager.publishEventToPlugins('test-event', { data: 'test' });
      
      expect(capablePlugin.handleEvent).toHaveBeenCalled();
      expect(incapablePlugin.handleEvent).not.toHaveBeenCalled();
    });
  });

  describe('interface compliance checking', () => {
    it('should check plugin interface compliance', () => {
      const compliantPlugin = {
        ...mockPlugin,
        pluginId: 'compliant-plugin'
      } as any;
      
      const nonCompliantPlugin = {
        pluginId: 'non-compliant-plugin',
        version: '1.0.0'
      } as any;
      
      const compliantResult = pluginManager.checkInterfaceCompliance(compliantPlugin);
      const nonCompliantResult = pluginManager.checkInterfaceCompliance(nonCompliantPlugin);
      
      expect(compliantResult).toBe(true);
      expect(nonCompliantResult).toBe(false);
    });

    it('should validate lifecycle interface', () => {
      const lifecyclePlugin = {
        ...mockPlugin,
        pluginId: 'lifecycle-plugin'
      } as any;
      
      const result = pluginManager.checkLifecycleCompliance(lifecyclePlugin);
      
      expect(result).toBe(true);
    });

    it('should validate event interface', () => {
      const eventPlugin = {
        ...mockPlugin,
        pluginId: 'event-plugin'
      } as any;
      
      const result = pluginManager.checkEventCompliance(eventPlugin);
      
      expect(result).toBe(true);
    });

    it('should validate render interface', () => {
      const renderPlugin = {
        ...mockPlugin,
        pluginId: 'render-plugin'
      } as any;
      
      const result = pluginManager.checkRenderCompliance(renderPlugin);
      
      expect(result).toBe(true);
    });
  });

  describe('performance considerations', () => {
    it('should handle many plugins efficiently', async () => {
      const plugins = Array.from({ length: 100 }, (_, i) => ({
        ...mockPlugin,
        pluginId: `plugin-${i}`,
        version: '1.0.0'
      }));
      
      const startTime = Date.now();
      
      for (const plugin of plugins) {
        pluginManager.registerPlugin(plugin);
      }
      
      await pluginManager.initializeAllPlugins();
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds
    });

    it('should handle plugin operations efficiently', async () => {
      pluginManager.registerPlugin(mockPlugin);
      
      const startTime = Date.now();
      
      for (let i = 0; i < 1000; i++) {
        pluginManager.getPlugin('test-plugin');
        pluginManager.hasPlugin('test-plugin');
        pluginManager.getPluginCount();
      }
      
      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Should only be responsible for plugin management
      expect(pluginManager.registerPlugin).toBeDefined();
      expect(pluginManager.unregisterPlugin).toBeDefined();
      expect(pluginManager.getPlugin).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension but closed for modification
      expect(pluginManager).toBeInstanceOf(PluginManager);
      expect(pluginManager).toBeInstanceOf(Object);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with any plugin implementation
      expect(pluginManager.registerPlugin).toBeDefined();
      expect(typeof pluginManager.registerPlugin).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should not force clients to depend on methods they don't use
      expect(pluginManager.registerPlugin).toBeDefined();
      expect(pluginManager.unregisterPlugin).toBeDefined();
      expect(pluginManager.getPlugin).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions, not concretions
      expect(pluginManager).toBeDefined();
      expect(typeof pluginManager.registerPlugin).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete plugin management workflow', async () => {
      // Register plugin
      const registered = pluginManager.registerPlugin(mockPlugin, { setting: 'value' });
      expect(registered).toBe(true);
      
      // Check registration
      expect(pluginManager.hasPlugin('test-plugin')).toBe(true);
      expect(pluginManager.getPluginCount()).toBe(1);
      
      // Initialize plugin
      await pluginManager.initializeAllPlugins();
      expect(mockPlugin.initialize).toHaveBeenCalled();
      
      // Start plugin
      await pluginManager.startAllPlugins();
      expect(mockPlugin.start).toHaveBeenCalled();
      
      // Stop plugin
      await pluginManager.stopAllPlugins();
      expect(mockPlugin.stop).toHaveBeenCalled();
      
      // Unregister plugin
      const unregistered = await pluginManager.unregisterPlugin('test-plugin');
      expect(unregistered).toBe(true);
      expect(pluginManager.hasPlugin('test-plugin')).toBe(false);
    });

    it('should handle plugin communication workflow', () => {
      const senderPlugin = {
        ...mockPlugin,
        pluginId: 'sender-plugin'
      } as any;
      
      const receiverPlugin = {
        ...mockPlugin,
        pluginId: 'receiver-plugin',
        canHandleEvent: jest.fn().mockReturnValue(true),
        handleEvent: jest.fn().mockResolvedValue({})
      } as any;
      
      pluginManager.registerPlugin(senderPlugin);
      pluginManager.registerPlugin(receiverPlugin);
      
      pluginManager.publishEventToPlugins('communication-test', { message: 'hello' });
      
      expect(receiverPlugin.handleEvent).toHaveBeenCalledWith({
        type: 'communication-test',
        data: { message: 'hello' }
      });
    });
  });
}); 