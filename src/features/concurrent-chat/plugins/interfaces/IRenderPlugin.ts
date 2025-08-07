import { ReactNode } from 'react';
import { ConcurrentMessage } from '../../core/types/interfaces/IMessageProcessor';

/**
 * Interface for plugins that handle rendering
 * Allows plugins to customize how messages and UI components are rendered
 */
export interface IRenderPlugin {
  /**
   * Render a message or component
   * @param message The message to render
   * @returns React node to render
   */
  render(message: ConcurrentMessage): ReactNode;

  /**
   * Check if this plugin can render a specific message
   * @param message The message to check
   * @returns True if the plugin can render this message
   */
  canRender(message: ConcurrentMessage): boolean;

  /**
   * Get the priority of this plugin for rendering
   * Higher priority plugins render first
   * @returns Priority number (higher = higher priority)
   */
  getRenderPriority(): number;

  /**
   * Get the component type this plugin renders
   * @returns String identifier for the component type
   */
  getComponentType(): string;

  /**
   * Check if this plugin should override default rendering
   * @param message The message to check
   * @returns True if this plugin should override default rendering
   */
  shouldOverride(message: ConcurrentMessage): boolean;
} 