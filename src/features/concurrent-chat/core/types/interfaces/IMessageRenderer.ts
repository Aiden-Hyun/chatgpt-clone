import { ReactNode } from 'react';
import { ConcurrentMessage } from '../messages';

/**
 * Interface for message rendering in the concurrent chat system
 * Follows SOLID principles with single responsibility for message rendering
 */
export interface IMessageRenderer {
  /**
   * Render a message as a React component
   * @param message The message to render
   * @returns React node representing the rendered message
   */
  render(message: ConcurrentMessage): ReactNode;

  /**
   * Check if this renderer can handle a specific message type
   * @param message The message to check
   * @returns True if this renderer can handle the message
   */
  canRender(message: ConcurrentMessage): boolean;

  /**
   * Get the priority of this renderer
   * Higher priority renderers are used first
   * @returns Priority number (higher = higher priority)
   */
  getPriority(): number;

  /**
   * Get the supported message types for this renderer
   * @returns Array of supported message types
   */
  getSupportedTypes(): string[];

  /**
   * Check if this renderer should override default rendering
   * @param message The message to check
   * @returns True if this renderer should override default rendering
   */
  shouldOverride(message: ConcurrentMessage): boolean;
} 