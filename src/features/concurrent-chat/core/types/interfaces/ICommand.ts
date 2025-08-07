/**
 * Interface for the Command pattern in the concurrent chat system.
 * Follows SOLID principles with single responsibility for command execution.
 * 
 * This interface defines the contract for any command implementation,
 * supporting execution, undo functionality, and undo capability checking.
 */
export interface ICommand {
  /**
   * Execute the command asynchronously.
   * 
   * @returns Promise that resolves when execution is complete
   */
  execute(): Promise<any>;

  /**
   * Check if the command can be undone.
   * 
   * @returns boolean indicating if undo is possible
   */
  canUndo(): boolean;

  /**
   * Undo the command asynchronously.
   * 
   * @returns Promise that resolves when undo is complete
   */
  undo(): Promise<any>;
}

/**
 * Interface for plugins in the concurrent chat system
 */
export interface IPlugin {
  /**
   * Unique identifier for the plugin
   */
  readonly id: string;

  /**
   * Human-readable name for the plugin
   */
  readonly name: string;

  /**
   * Version string for the plugin
   */
  readonly version: string;

  /**
   * Initialize the plugin
   */
  init(): Promise<void>;

  /**
   * Clean up the plugin
   */
  destroy(): Promise<void>;
}

/**
 * Default implementation of ICommand for testing purposes.
 * This provides a concrete implementation that satisfies the interface contract.
 */
export class DefaultCommand implements ICommand {
  private executed = false;

  async execute(): Promise<any> {
    this.executed = true;
    return Promise.resolve();
  }

  canUndo(): boolean {
    return this.executed;
  }

  async undo(): Promise<any> {
    if (this.canUndo()) {
      this.executed = false;
    }
    return Promise.resolve({ undone: this.executed === false });
  }
}

/**
 * Factory function to create a command instance.
 * This allows the tests to work with concrete implementations.
 */
export function createCommand(): ICommand {
  return new DefaultCommand();
} 