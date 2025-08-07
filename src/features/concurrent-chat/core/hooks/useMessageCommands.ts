import { useCallback, useRef, useState } from 'react';
import { ServiceContainer } from '../container/ServiceContainer';
import { EventBus } from '../events/EventBus';
import { ICommand } from '../types/interfaces/ICommand';

/**
 * Hook for managing message commands in the concurrent chat system
 * Handles command execution, history, and undo/redo functionality
 */
export function useMessageCommands(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Command history
  const [commandHistory, setCommandHistory] = useState<ICommand[]>([]);
  const [undoStack, setUndoStack] = useState<ICommand[]>([]);
  
  // Command execution state
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastExecutedCommand, setLastExecutedCommand] = useState<ICommand | null>(null);
  
  // Refs for command tracking
  const commandHistoryRef = useRef<ICommand[]>([]);
  const undoStackRef = useRef<ICommand[]>([]);
  
  // Update refs when state changes
  commandHistoryRef.current = commandHistory;
  undoStackRef.current = undoStack;

  /**
   * Execute a command
   * @param command The command to execute
   * @returns Promise that resolves when command execution is complete
   */
  const executeCommand = useCallback(async (command: ICommand): Promise<void> => {
    try {
      setIsExecuting(true);
      
      // Execute the command
      await command.execute();
      
      // Add to history
      setCommandHistory(prev => [...prev, command]);
      setLastExecutedCommand(command);
      
      // Clear undo stack when new command is executed
      setUndoStack([]);
      
      // Publish command executed event
      eventBus.publish('COMMAND_EXECUTED', {
        type: 'COMMAND_EXECUTED',
        timestamp: Date.now(),
        command: command,
        success: true,
      });
      
    } catch (error) {
      // Publish command failed event
      eventBus.publish('COMMAND_FAILED', {
        type: 'COMMAND_FAILED',
        timestamp: Date.now(),
        command: command,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [eventBus]);

  /**
   * Undo the last executed command
   * @returns Promise that resolves when undo is complete
   */
  const undoLastCommand = useCallback(async (): Promise<void> => {
    const lastCommand = commandHistoryRef.current[commandHistoryRef.current.length - 1];
    
    if (!lastCommand || !lastCommand.canUndo()) {
      throw new Error('No command available to undo');
    }

    try {
      setIsExecuting(true);
      
      // Undo the command
      await lastCommand.undo();
      
      // Move command from history to undo stack
      setCommandHistory(prev => prev.slice(0, -1));
      setUndoStack(prev => [...prev, lastCommand]);
      
      // Publish undo event
      eventBus.publish('COMMAND_UNDONE', {
        type: 'COMMAND_UNDONE',
        timestamp: Date.now(),
        command: lastCommand,
      });
      
    } catch (error) {
      // Publish undo failed event
      eventBus.publish('COMMAND_UNDO_FAILED', {
        type: 'COMMAND_UNDO_FAILED',
        timestamp: Date.now(),
        command: lastCommand,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [eventBus]);

  /**
   * Redo the last undone command
   * @returns Promise that resolves when redo is complete
   */
  const redoLastCommand = useCallback(async (): Promise<void> => {
    const lastUndoneCommand = undoStackRef.current[undoStackRef.current.length - 1];
    
    if (!lastUndoneCommand) {
      throw new Error('No command available to redo');
    }

    try {
      setIsExecuting(true);
      
      // Re-execute the command
      await lastUndoneCommand.execute();
      
      // Move command from undo stack back to history
      setUndoStack(prev => prev.slice(0, -1));
      setCommandHistory(prev => [...prev, lastUndoneCommand]);
      
      // Publish redo event
      eventBus.publish('COMMAND_REDONE', {
        type: 'COMMAND_REDONE',
        timestamp: Date.now(),
        command: lastUndoneCommand,
      });
      
    } catch (error) {
      // Publish redo failed event
      eventBus.publish('COMMAND_REDO_FAILED', {
        type: 'COMMAND_REDO_FAILED',
        timestamp: Date.now(),
        command: lastUndoneCommand,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      throw error;
    } finally {
      setIsExecuting(false);
    }
  }, [eventBus]);

  /**
   * Clear command history
   */
  const clearHistory = useCallback(() => {
    setCommandHistory([]);
    setUndoStack([]);
    setLastExecutedCommand(null);
    
    // Publish history cleared event
    eventBus.publish('COMMAND_HISTORY_CLEARED', {
      type: 'COMMAND_HISTORY_CLEARED',
      timestamp: Date.now(),
    });
  }, [eventBus]);

  /**
   * Get command history
   * @returns Array of executed commands
   */
  const getCommandHistory = useCallback(() => {
    return [...commandHistory];
  }, [commandHistory]);

  /**
   * Get undo stack
   * @returns Array of undone commands
   */
  const getUndoStack = useCallback(() => {
    return [...undoStack];
  }, [undoStack]);

  /**
   * Check if undo is available
   * @returns True if undo is available
   */
  const canUndo = useCallback(() => {
    const lastCommand = commandHistory[commandHistory.length - 1];
    return lastCommand && lastCommand.canUndo();
  }, [commandHistory]);

  /**
   * Check if redo is available
   * @returns True if redo is available
   */
  const canRedo = useCallback(() => {
    return undoStack.length > 0;
  }, [undoStack]);

  /**
   * Get the number of commands in history
   * @returns Number of commands in history
   */
  const getHistoryCount = useCallback(() => {
    return commandHistory.length;
  }, [commandHistory]);

  /**
   * Get the number of commands in undo stack
   * @returns Number of commands in undo stack
   */
  const getUndoCount = useCallback(() => {
    return undoStack.length;
  }, [undoStack]);

  /**
   * Execute multiple commands in sequence
   * @param commands Array of commands to execute
   * @returns Promise that resolves when all commands are complete
   */
  const executeCommands = useCallback(async (commands: ICommand[]): Promise<void> => {
    for (const command of commands) {
      await executeCommand(command);
    }
  }, [executeCommand]);

  /**
   * Execute multiple commands in parallel
   * @param commands Array of commands to execute
   * @returns Promise that resolves when all commands are complete
   */
  const executeCommandsParallel = useCallback(async (commands: ICommand[]): Promise<void> => {
    await Promise.all(commands.map(command => executeCommand(command)));
  }, [executeCommand]);

  return {
    // State
    isExecuting,
    lastExecutedCommand,
    
    // Actions
    executeCommand,
    executeCommands,
    executeCommandsParallel,
    undoLastCommand,
    redoLastCommand,
    clearHistory,
    
    // Queries
    getCommandHistory,
    getUndoStack,
    canUndo,
    canRedo,
    getHistoryCount,
    getUndoCount,
  };
} 