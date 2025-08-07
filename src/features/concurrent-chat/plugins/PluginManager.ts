import { BasePlugin } from './BasePlugin';
import { EventBus } from '../core/events/EventBus';
import { ServiceContainer } from '../core/container/ServiceContainer';
import { MessageEvent } from '../core/types/events/MessageEvents';
import { IEventPlugin } from './interfaces/IEventPlugin';
import { IRenderPlugin } from './interfaces/IRenderPlugin';
import { ILifecyclePlugin } from './interfaces/ILifecyclePlugin';

/**
 * Plugin Manager for the concurrent chat system
 * Handles plugin registration, lifecycle management, and coordination
 */
export class PluginManager {
  private plugins = new Map<string, BasePlugin>();
  private eventPlugins = new Map<string, IEventPlugin>();
  private renderPlugins = new Map<string, IRenderPlugin>();
  private lifecyclePlugins = new Map<string, ILifecyclePlugin>();
  private eventBus: EventBus;
  private container: ServiceContainer;
  private initialized = false;

  constructor(eventBus: EventBus, container: ServiceContainer) {
    this.eventBus = eventBus;
    this.container = container;
  }

  /**
   * Register a plugin with the manager
   * @param plugin The plugin to register
   */
  async registerPlugin(plugin: BasePlugin): Promise<void> {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID '${plugin.id}' is already registered`);
    }

    // Register the plugin
    this.plugins.set(plugin.id, plugin);

    // Register as event plugin if it implements IEventPlugin
    if (this.isEventPlugin(plugin)) {
      this.eventPlugins.set(plugin.id, plugin);
    }

    // Register as render plugin if it implements IRenderPlugin
    if (this.isRenderPlugin(plugin)) {
      this.renderPlugins.set(plugin.id, plugin);
    }

    // Register as lifecycle plugin if it implements ILifecyclePlugin
    if (this.isLifecyclePlugin(plugin)) {
      this.lifecyclePlugins.set(plugin.id, plugin);
    }

    // Initialize the plugin if the manager is already initialized
    if (this.initialized) {
      await plugin.init();
    }
  }

  /**
   * Unregister a plugin from the manager
   * @param pluginId The ID of the plugin to unregister
   */
  async unregisterPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) {
      throw new Error(`Plugin with ID '${pluginId}' is not registered`);
    }

    // Destroy the plugin
    await plugin.destroy();

    // Remove from all maps
    this.plugins.delete(pluginId);
    this.eventPlugins.delete(pluginId);
    this.renderPlugins.delete(pluginId);
    this.lifecyclePlugins.delete(pluginId);
  }

  /**
   * Initialize all registered plugins
   */
  async initializePlugins(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const initPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        await plugin.init();
        console.log(`Initialized plugin: ${plugin.name} (${plugin.id})`);
      } catch (error) {
        console.error(`Failed to initialize plugin ${plugin.id}:`, error);
        throw error;
      }
    });

    await Promise.all(initPromises);
    this.initialized = true;
  }

  /**
   * Start all registered plugins
   */
  async startPlugins(): Promise<void> {
    const startPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        await plugin.start();
        console.log(`Started plugin: ${plugin.name} (${plugin.id})`);
      } catch (error) {
        console.error(`Failed to start plugin ${plugin.id}:`, error);
        throw error;
      }
    });

    await Promise.all(startPromises);
  }

  /**
   * Stop all registered plugins
   */
  async stopPlugins(): Promise<void> {
    const stopPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        await plugin.stop();
        console.log(`Stopped plugin: ${plugin.name} (${plugin.id})`);
      } catch (error) {
        console.error(`Failed to stop plugin ${plugin.id}:`, error);
        throw error;
      }
    });

    await Promise.all(stopPromises);
  }

  /**
   * Destroy all registered plugins
   */
  async destroyPlugins(): Promise<void> {
    const destroyPromises = Array.from(this.plugins.values()).map(async (plugin) => {
      try {
        await plugin.destroy();
        console.log(`Destroyed plugin: ${plugin.name} (${plugin.id})`);
      } catch (error) {
        console.error(`Failed to destroy plugin ${plugin.id}:`, error);
        throw error;
      }
    });

    await Promise.all(destroyPromises);
    this.plugins.clear();
    this.eventPlugins.clear();
    this.renderPlugins.clear();
    this.lifecyclePlugins.clear();
    this.initialized = false;
  }

  /**
   * Handle an event by routing it to appropriate event plugins
   * @param event The event to handle
   */
  async handleEvent(event: MessageEvent): Promise<void> {
    const eventType = event.type;
    const handlers: Promise<void>[] = [];

    // Find all event plugins that can handle this event type
    for (const plugin of this.eventPlugins.values()) {
      if (plugin.canHandleEvent(eventType)) {
        handlers.push(plugin.handleEvent(event));
      }
    }

    // Execute all handlers
    await Promise.all(handlers);
  }

  /**
   * Get all render plugins that can render a specific message
   * @param message The message to check
   * @returns Array of render plugins sorted by priority
   */
  getRenderPluginsForMessage(message: any): IRenderPlugin[] {
    const plugins = Array.from(this.renderPlugins.values())
      .filter(plugin => plugin.canRender(message))
      .sort((a, b) => b.getRenderPriority() - a.getRenderPriority());

    return plugins;
  }

  /**
   * Get a plugin by ID
   * @param pluginId The plugin ID
   * @returns The plugin instance or undefined
   */
  getPlugin(pluginId: string): BasePlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get all registered plugins
   * @returns Array of all plugin instances
   */
  getAllPlugins(): BasePlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all event plugins
   * @returns Array of event plugin instances
   */
  getEventPlugins(): IEventPlugin[] {
    return Array.from(this.eventPlugins.values());
  }

  /**
   * Get all render plugins
   * @returns Array of render plugin instances
   */
  getRenderPlugins(): IRenderPlugin[] {
    return Array.from(this.renderPlugins.values());
  }

  /**
   * Get all lifecycle plugins
   * @returns Array of lifecycle plugin instances
   */
  getLifecyclePlugins(): ILifecyclePlugin[] {
    return Array.from(this.lifecyclePlugins.values());
  }

  /**
   * Check if a plugin is registered
   * @param pluginId The plugin ID to check
   * @returns True if the plugin is registered
   */
  isPluginRegistered(pluginId: string): boolean {
    return this.plugins.has(pluginId);
  }

  /**
   * Get plugin statistics
   * @returns Object with plugin statistics
   */
  getPluginStats(): {
    total: number;
    eventPlugins: number;
    renderPlugins: number;
    lifecyclePlugins: number;
    active: number;
    initialized: number;
  } {
    const total = this.plugins.size;
    const eventPlugins = this.eventPlugins.size;
    const renderPlugins = this.renderPlugins.size;
    const lifecyclePlugins = this.lifecyclePlugins.size;
    const active = Array.from(this.plugins.values()).filter(p => p.isActive()).length;
    const initialized = Array.from(this.plugins.values()).filter(p => p.getState() === 'initialized').length;

    return {
      total,
      eventPlugins,
      renderPlugins,
      lifecyclePlugins,
      active,
      initialized,
    };
  }

  /**
   * Type guard to check if a plugin implements IEventPlugin
   */
  private isEventPlugin(plugin: BasePlugin): plugin is BasePlugin & IEventPlugin {
    return 'handleEvent' in plugin && 'getEventTypes' in plugin;
  }

  /**
   * Type guard to check if a plugin implements IRenderPlugin
   */
  private isRenderPlugin(plugin: BasePlugin): plugin is BasePlugin & IRenderPlugin {
    return 'render' in plugin && 'canRender' in plugin;
  }

  /**
   * Type guard to check if a plugin implements ILifecyclePlugin
   */
  private isLifecyclePlugin(plugin: BasePlugin): plugin is BasePlugin & ILifecyclePlugin {
    return 'start' in plugin && 'stop' in plugin;
  }
} 