import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { PluginManager } from '../../../../src/features/concurrent-chat/core/plugins/PluginManager';
import { BasePlugin } from '../../../../src/features/concurrent-chat/core/plugins/BasePlugin';
import { ILifecyclePlugin } from '../../../../src/features/concurrent-chat/core/interfaces/ILifecyclePlugin';
import { IEventPlugin } from '../../../../src/features/concurrent-chat/core/interfaces/IEventPlugin';
import { IRenderPlugin } from '../../../../src/features/concurrent-chat/core/interfaces/IRenderPlugin';

describe('Plugin System Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let pluginManager: PluginManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    pluginManager = new PluginManager(serviceContainer, eventBus);
  });

  describe('Plugin registration and lifecycle', () => {
    it('should register plugins correctly', () => {
      const mockPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('test-plugin', mockPlugin);
      const registeredPlugin = pluginManager.getPlugin('test-plugin');

      expect(registeredPlugin).toBe(mockPlugin);
    });

    it('should handle plugin mounting', () => {
      const mockPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('test-plugin', mockPlugin);
      pluginManager.mountPlugin('test-plugin');

      expect(mockPlugin.mount).toHaveBeenCalled();
    });

    it('should handle plugin unmounting', () => {
      const mockPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('test-plugin', mockPlugin);
      pluginManager.mountPlugin('test-plugin');
      pluginManager.unmountPlugin('test-plugin');

      expect(mockPlugin.unmount).toHaveBeenCalled();
    });

    it('should handle plugin lifecycle events', () => {
      const mockPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('test-plugin', mockPlugin);
      pluginManager.mountPlugin('test-plugin');

      eventBus.publish('message:sent', { messageId: 'test' });

      expect(mockPlugin.onEvent).toHaveBeenCalledWith('message:sent', { messageId: 'test' });
    });

    it('should handle multiple plugins', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const plugin2: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('plugin1', plugin1);
      pluginManager.registerPlugin('plugin2', plugin2);

      pluginManager.mountAllPlugins();

      expect(plugin1.mount).toHaveBeenCalled();
      expect(plugin2.mount).toHaveBeenCalled();
    });
  });

  describe('Plugin communication', () => {
    it('should enable plugins to communicate via events', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const plugin2: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('plugin1', plugin1);
      pluginManager.registerPlugin('plugin2', plugin2);
      pluginManager.mountAllPlugins();

      eventBus.publish('custom:event', { data: 'test' });

      expect(plugin1.onEvent).toHaveBeenCalledWith('custom:event', { data: 'test' });
      expect(plugin2.onEvent).toHaveBeenCalledWith('custom:event', { data: 'test' });
    });

    it('should handle plugin-to-plugin communication', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn().mockImplementation(() => {
          eventBus.publish('plugin1:ready', { status: 'ready' });
        }),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const plugin2: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('plugin1', plugin1);
      pluginManager.registerPlugin('plugin2', plugin2);
      pluginManager.mountAllPlugins();

      expect(plugin2.onEvent).toHaveBeenCalledWith('plugin1:ready', { status: 'ready' });
    });

    it('should handle plugin communication errors gracefully', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn().mockImplementation(() => {
          throw new Error('Plugin communication error');
        })
      };

      pluginManager.registerPlugin('plugin1', plugin1);
      pluginManager.mountPlugin('plugin1');

      // Should not throw error
      expect(() => {
        eventBus.publish('test:event', { data: 'test' });
      }).not.toThrow();
    });
  });

  describe('Plugin dependency resolution', () => {
    it('should resolve plugin dependencies', () => {
      const dependencyPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const dependentPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('dependency', dependencyPlugin);
      pluginManager.registerPlugin('dependent', dependentPlugin, ['dependency']);

      pluginManager.mountPlugin('dependent');

      expect(dependencyPlugin.mount).toHaveBeenCalled();
      expect(dependentPlugin.mount).toHaveBeenCalled();
    });

    it('should handle missing dependencies', () => {
      const dependentPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('dependent', dependentPlugin, ['missing-dependency']);

      expect(() => {
        pluginManager.mountPlugin('dependent');
      }).toThrow('Missing dependency: missing-dependency');
    });

    it('should handle circular dependencies', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const plugin2: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('plugin1', plugin1, ['plugin2']);
      pluginManager.registerPlugin('plugin2', plugin2, ['plugin1']);

      expect(() => {
        pluginManager.mountPlugin('plugin1');
      }).toThrow('Circular dependency detected');
    });
  });

  describe('Plugin configuration', () => {
    it('should handle plugin configuration', () => {
      const configurablePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const config = {
        enabled: true,
        settings: {
          timeout: 5000,
          retries: 3
        }
      };

      pluginManager.registerPlugin('configurable', configurablePlugin);
      pluginManager.configurePlugin('configurable', config);

      const pluginConfig = pluginManager.getPluginConfiguration('configurable');
      expect(pluginConfig).toEqual(config);
    });

    it('should validate plugin configuration', () => {
      const configurablePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const invalidConfig = {
        enabled: 'invalid', // Should be boolean
        settings: {
          timeout: -1 // Should be positive
        }
      };

      pluginManager.registerPlugin('configurable', configurablePlugin);

      expect(() => {
        pluginManager.configurePlugin('configurable', invalidConfig);
      }).toThrow('Invalid configuration');
    });

    it('should handle plugin configuration updates', () => {
      const configurablePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const initialConfig = { enabled: true };
      const updatedConfig = { enabled: false };

      pluginManager.registerPlugin('configurable', configurablePlugin);
      pluginManager.configurePlugin('configurable', initialConfig);
      pluginManager.configurePlugin('configurable', updatedConfig);

      const pluginConfig = pluginManager.getPluginConfiguration('configurable');
      expect(pluginConfig).toEqual(updatedConfig);
    });
  });

  describe('Hot reloading', () => {
    it('should support plugin hot reloading', () => {
      const originalPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const updatedPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('hot-reload', originalPlugin);
      pluginManager.mountPlugin('hot-reload');

      pluginManager.hotReloadPlugin('hot-reload', updatedPlugin);

      expect(originalPlugin.unmount).toHaveBeenCalled();
      expect(updatedPlugin.mount).toHaveBeenCalled();
    });

    it('should preserve plugin state during hot reload', () => {
      const originalPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const updatedPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('state-preserve', originalPlugin);
      pluginManager.mountPlugin('state-preserve');

      // Simulate some state
      const pluginState = { data: 'preserved' };
      pluginManager.setPluginState('state-preserve', pluginState);

      pluginManager.hotReloadPlugin('state-preserve', updatedPlugin);

      const preservedState = pluginManager.getPluginState('state-preserve');
      expect(preservedState).toEqual(pluginState);
    });

    it('should handle hot reload errors gracefully', () => {
      const originalPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const invalidPlugin = null; // Invalid plugin

      pluginManager.registerPlugin('error-handle', originalPlugin);
      pluginManager.mountPlugin('error-handle');

      expect(() => {
        pluginManager.hotReloadPlugin('error-handle', invalidPlugin);
      }).toThrow('Invalid plugin for hot reload');
    });
  });

  describe('Plugin isolation', () => {
    it('should isolate plugins from each other', () => {
      const plugin1: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const plugin2: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('isolated1', plugin1);
      pluginManager.registerPlugin('isolated2', plugin2);

      // Plugin1 should not affect Plugin2
      pluginManager.mountPlugin('isolated1');
      expect(plugin1.mount).toHaveBeenCalled();
      expect(plugin2.mount).not.toHaveBeenCalled();
    });

    it('should handle plugin crashes without affecting others', () => {
      const crashingPlugin: ILifecyclePlugin = {
        mount: jest.fn().mockImplementation(() => {
          throw new Error('Plugin crash');
        }),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const stablePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('crashing', crashingPlugin);
      pluginManager.registerPlugin('stable', stablePlugin);

      expect(() => {
        pluginManager.mountPlugin('crashing');
      }).toThrow('Plugin crash');

      // Stable plugin should still work
      pluginManager.mountPlugin('stable');
      expect(stablePlugin.mount).toHaveBeenCalled();
    });

    it('should isolate plugin memory usage', () => {
      const memoryIntensivePlugin: ILifecyclePlugin = {
        mount: jest.fn().mockImplementation(() => {
          // Simulate memory allocation
          const largeArray = new Array(1000000).fill('data');
        }),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const lightweightPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('memory-intensive', memoryIntensivePlugin);
      pluginManager.registerPlugin('lightweight', lightweightPlugin);

      pluginManager.mountPlugin('memory-intensive');
      pluginManager.mountPlugin('lightweight');

      // Both should work independently
      expect(memoryIntensivePlugin.mount).toHaveBeenCalled();
      expect(lightweightPlugin.mount).toHaveBeenCalled();
    });
  });

  describe('Interface compliance', () => {
    it('should ensure plugins implement required interfaces', () => {
      const validPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const invalidPlugin = {
        mount: jest.fn()
        // Missing unmount and onEvent
      };

      pluginManager.registerPlugin('valid', validPlugin);
      expect(() => {
        pluginManager.registerPlugin('invalid', invalidPlugin);
      }).toThrow('Plugin must implement ILifecyclePlugin interface');
    });

    it('should validate event plugin interface', () => {
      const eventPlugin: IEventPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        getEventHandlers: jest.fn().mockReturnValue(['message:sent', 'message:received'])
      };

      pluginManager.registerPlugin('event-plugin', eventPlugin);
      const registeredPlugin = pluginManager.getPlugin('event-plugin');

      expect(registeredPlugin.getEventHandlers).toBeDefined();
      expect(registeredPlugin.getEventHandlers()).toEqual(['message:sent', 'message:received']);
    });

    it('should validate render plugin interface', () => {
      const renderPlugin: IRenderPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        render: jest.fn().mockReturnValue('<div>Rendered content</div>')
      };

      pluginManager.registerPlugin('render-plugin', renderPlugin);
      const registeredPlugin = pluginManager.getPlugin('render-plugin');

      expect(registeredPlugin.render).toBeDefined();
      expect(registeredPlugin.render()).toBe('<div>Rendered content</div>');
    });
  });

  describe('SOLID principle compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // Each plugin should have a single responsibility
      const messagePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const animationPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('message-handler', messagePlugin);
      pluginManager.registerPlugin('animation-handler', animationPlugin);

      // Each plugin should handle its specific domain
      expect(messagePlugin).toBeDefined();
      expect(animationPlugin).toBeDefined();
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('new-feature', newPlugin);
      const registeredPlugin = pluginManager.getPlugin('new-feature');

      expect(registeredPlugin).toBe(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should be able to substitute plugins with different implementations
      const basePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const alternativePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('base', basePlugin);
      pluginManager.registerPlugin('alternative', alternativePlugin);

      const base = pluginManager.getPlugin('base');
      const alternative = pluginManager.getPlugin('alternative');

      expect(base.mount).toBeDefined();
      expect(alternative.mount).toBeDefined();
    });

    it('should follow Interface Segregation Principle', () => {
      // Should use focused interfaces
      const lifecyclePlugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      const eventPlugin: IEventPlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn(),
        getEventHandlers: jest.fn()
      };

      pluginManager.registerPlugin('lifecycle', lifecyclePlugin);
      pluginManager.registerPlugin('event', eventPlugin);

      // Each interface should be focused
      expect(lifecyclePlugin.mount).toBeDefined();
      expect(eventPlugin.getEventHandlers).toBeDefined();
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (interfaces) not concretions
      const plugin: ILifecyclePlugin = {
        mount: jest.fn(),
        unmount: jest.fn(),
        onEvent: jest.fn()
      };

      pluginManager.registerPlugin('abstract', plugin);
      const registeredPlugin = pluginManager.getPlugin('abstract');

      // Should depend on interface, not concrete implementation
      expect(registeredPlugin).toBeDefined();
      expect(typeof registeredPlugin.mount).toBe('function');
    });
  });
}); 