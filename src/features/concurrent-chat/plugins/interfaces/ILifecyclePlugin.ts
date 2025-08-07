/**
 * Interface for plugins that need lifecycle management
 * Handles initialization, starting, stopping, and cleanup of plugins
 */
export interface ILifecyclePlugin {
  /**
   * Initialize the plugin with necessary resources
   * Called when the plugin is first loaded
   */
  init(): Promise<void>;

  /**
   * Start the plugin's active operations
   * Called after initialization when the plugin should begin working
   */
  start(): Promise<void>;

  /**
   * Stop the plugin's active operations
   * Called when the plugin should pause but remain loaded
   */
  stop(): Promise<void>;

  /**
   * Clean up all resources and destroy the plugin
   * Called when the plugin is being unloaded
   */
  destroy(): Promise<void>;

  /**
   * Check if the plugin is currently active
   */
  isActive(): boolean;

  /**
   * Get the current state of the plugin
   */
  getState(): 'initialized' | 'started' | 'stopped' | 'destroyed';
} 