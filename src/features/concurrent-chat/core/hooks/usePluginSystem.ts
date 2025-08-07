import { useCallback, useEffect, useRef, useState } from 'react';
import { BasePlugin } from '../../plugins/BasePlugin';
import { PluginManager } from '../../plugins/PluginManager';
import { ServiceContainer } from '../container/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { MessageEvent } from '../types/events/MessageEvents';

/**
 * Hook for managing the plugin system in the concurrent chat system
 * Handles plugin registration, lifecycle management, and coordination
 */
export function usePluginSystem(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Plugin manager
  const [pluginManager] = useState(() => new PluginManager(eventBus, serviceContainer));
  
  // Plugin state
  const [plugins, setPlugins] = useState<BasePlugin[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Plugin statistics
  const [pluginStats, setPluginStats] = useState({
    total: 0,
    eventPlugins: 0,
    renderPlugins: 0,
    lifecyclePlugins: 0,
    active: 0,
    initialized: 0,
  });

  // Refs for cleanup
  const eventSubscriptionsRef = useRef<string[]>([]);

  // Initialize plugin system
  useEffect(() => {
    const initializePluginSystem = async () => {
      try {
        setError(null);
        
        // Initialize plugin manager
        await pluginManager.initializePlugins();
        setIsInitialized(true);
        
        // Update plugin list and stats
        updatePluginState();
        
        // Set up event subscriptions
        setupEventSubscriptions();
        
      } catch (err) {
        setError(`Failed to initialize plugin system: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    initializePluginSystem();

    // Cleanup function
    return () => {
      cleanupEventSubscriptions();
      pluginManager.destroyPlugins();
    };
  }, [pluginManager]);

  // Set up event subscriptions
  const setupEventSubscriptions = useCallback(() => {
    const subscriptions: string[] = [];

    // Subscribe to plugin events
    subscriptions.push(
      eventBus.subscribe('PLUGIN_REGISTERED', () => {
        updatePluginState();
      })
    );

    subscriptions.push(
      eventBus.subscribe('PLUGIN_UNREGISTERED', () => {
        updatePluginState();
      })
    );

    subscriptions.push(
      eventBus.subscribe('PLUGIN_STARTED', () => {
        updatePluginState();
      })
    );

    subscriptions.push(
      eventBus.subscribe('PLUGIN_STOPPED', () => {
        updatePluginState();
      })
    );

    eventSubscriptionsRef.current = subscriptions;
  }, [eventBus]);

  // Clean up event subscriptions
  const cleanupEventSubscriptions = useCallback(() => {
    eventSubscriptionsRef.current.forEach(subscriptionId => {
      eventBus.unsubscribeById(subscriptionId);
    });
    eventSubscriptionsRef.current = [];
  }, [eventBus]);

  // Update plugin state
  const updatePluginState = useCallback(() => {
    const allPlugins = pluginManager.getAllPlugins();
    const stats = pluginManager.getPluginStats();
    
    setPlugins(allPlugins);
    setPluginStats(stats);
  }, [pluginManager]);

  /**
   * Register a plugin
   * @param plugin The plugin to register
   */
  const registerPlugin = useCallback(async (plugin: BasePlugin) => {
    try {
      setError(null);
      await pluginManager.registerPlugin(plugin);
      updatePluginState();
      
      // Publish plugin registered event
      eventBus.publish('PLUGIN_REGISTERED', {
        type: 'PLUGIN_REGISTERED',
        timestamp: Date.now(),
        plugin: plugin,
      });
      
    } catch (err) {
      setError(`Failed to register plugin: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [pluginManager, eventBus, updatePluginState]);

  /**
   * Unregister a plugin
   * @param pluginId The ID of the plugin to unregister
   */
  const unregisterPlugin = useCallback(async (pluginId: string) => {
    try {
      setError(null);
      await pluginManager.unregisterPlugin(pluginId);
      updatePluginState();
      
      // Publish plugin unregistered event
      eventBus.publish('PLUGIN_UNREGISTERED', {
        type: 'PLUGIN_UNREGISTERED',
        timestamp: Date.now(),
        pluginId: pluginId,
      });
      
    } catch (err) {
      setError(`Failed to unregister plugin: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    }
  }, [pluginManager, eventBus, updatePluginState]);

  /**
   * Start all plugins
   */
  const startPlugins = useCallback(async () => {
    try {
      setError(null);
      setIsStarting(true);
      
      await pluginManager.startPlugins();
      updatePluginState();
      
      // Publish plugins started event
      eventBus.publish('PLUGINS_STARTED', {
        type: 'PLUGINS_STARTED',
        timestamp: Date.now(),
      });
      
    } catch (err) {
      setError(`Failed to start plugins: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsStarting(false);
    }
  }, [pluginManager, eventBus, updatePluginState]);

  /**
   * Stop all plugins
   */
  const stopPlugins = useCallback(async () => {
    try {
      setError(null);
      setIsStopping(true);
      
      await pluginManager.stopPlugins();
      updatePluginState();
      
      // Publish plugins stopped event
      eventBus.publish('PLUGINS_STOPPED', {
        type: 'PLUGINS_STOPPED',
        timestamp: Date.now(),
      });
      
    } catch (err) {
      setError(`Failed to stop plugins: ${err instanceof Error ? err.message : 'Unknown error'}`);
      throw err;
    } finally {
      setIsStopping(false);
    }
  }, [pluginManager, eventBus, updatePluginState]);

  /**
   * Get a plugin by ID
   * @param pluginId The plugin ID
   * @returns The plugin instance or undefined
   */
  const getPlugin = useCallback((pluginId: string) => {
    return pluginManager.getPlugin(pluginId);
  }, [pluginManager]);

  /**
   * Check if a plugin is registered
   * @param pluginId The plugin ID to check
   * @returns True if the plugin is registered
   */
  const isPluginRegistered = useCallback((pluginId: string) => {
    return pluginManager.isPluginRegistered(pluginId);
  }, [pluginManager]);

  /**
   * Get all event plugins
   * @returns Array of event plugin instances
   */
  const getEventPlugins = useCallback(() => {
    return pluginManager.getEventPlugins();
  }, [pluginManager]);

  /**
   * Get all render plugins
   * @returns Array of render plugin instances
   */
  const getRenderPlugins = useCallback(() => {
    return pluginManager.getRenderPlugins();
  }, [pluginManager]);

  /**
   * Get all lifecycle plugins
   * @returns Array of lifecycle plugin instances
   */
  const getLifecyclePlugins = useCallback(() => {
    return pluginManager.getLifecyclePlugins();
  }, [pluginManager]);

  /**
   * Handle an event with event plugins
   * @param event The event to handle
   */
  const handleEvent = useCallback(async (event: MessageEvent) => {
    try {
      await pluginManager.handleEvent(event);
    } catch (err) {
      setError(`Failed to handle event: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, [pluginManager]);

  /**
   * Get render plugins for a message
   * @param message The message to get render plugins for
   * @returns Array of render plugins that can render the message
   */
  const getRenderPluginsForMessage = useCallback((message: any) => {
    return pluginManager.getRenderPluginsForMessage(message);
  }, [pluginManager]);

  /**
   * Refresh plugin statistics
   */
  const refreshPluginStats = useCallback(() => {
    const stats = pluginManager.getPluginStats();
    setPluginStats(stats);
  }, [pluginManager]);

  return {
    // State
    plugins,
    isInitialized,
    isStarting,
    isStopping,
    error,
    pluginStats,
    
    // Actions
    registerPlugin,
    unregisterPlugin,
    startPlugins,
    stopPlugins,
    handleEvent,
    refreshPluginStats,
    
    // Queries
    getPlugin,
    isPluginRegistered,
    getEventPlugins,
    getRenderPlugins,
    getLifecyclePlugins,
    getRenderPluginsForMessage,
    
    // Plugin manager (for advanced usage)
    pluginManager,
  };
} 