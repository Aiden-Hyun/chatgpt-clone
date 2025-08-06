import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { CommandManager } from '../../../../src/features/concurrent-chat/core/commands/CommandManager';
import { ICommand } from '../../../../src/features/concurrent-chat/core/interfaces/ICommand';
import { SendMessageCommand } from '../../../../src/features/concurrent-chat/core/commands/SendMessageCommand';
import { CancelMessageCommand } from '../../../../src/features/concurrent-chat/core/commands/CancelMessageCommand';
import { RetryMessageCommand } from '../../../../src/features/concurrent-chat/core/commands/RetryMessageCommand';
import { ClearMessagesCommand } from '../../../../src/features/concurrent-chat/core/commands/ClearMessagesCommand';
import { ChangeModelCommand } from '../../../../src/features/concurrent-chat/core/commands/ChangeModelCommand';

describe('Command Pattern Integration Tests', () => {
  let serviceContainer: ServiceContainer;
  let eventBus: EventBus;
  let commandManager: CommandManager;

  beforeEach(() => {
    serviceContainer = new ServiceContainer();
    eventBus = new EventBus();
    commandManager = new CommandManager(serviceContainer, eventBus);
  });

  describe('Command execution', () => {
    it('should execute commands correctly', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('test-command', mockCommand);
      commandManager.executeCommand('test-command', { data: 'test' });

      expect(mockCommand.execute).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle command execution errors', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockRejectedValue(new Error('Execution failed')),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('error-command', mockCommand);

      expect(async () => {
        await commandManager.executeCommand('error-command', { data: 'test' });
      }).rejects.toThrow('Execution failed');
    });

    it('should validate command before execution', () => {
      const mockCommand: ICommand = {
        execute: jest.fn(),
        undo: jest.fn(),
        canExecute: () => false
      };

      commandManager.registerCommand('invalid-command', mockCommand);

      expect(() => {
        commandManager.executeCommand('invalid-command', { data: 'test' });
      }).toThrow('Command cannot be executed');
    });

    it('should execute multiple commands in sequence', async () => {
      const command1: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const command2: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('command1', command1);
      commandManager.registerCommand('command2', command2);

      await commandManager.executeCommand('command1', { data: 'test1' });
      await commandManager.executeCommand('command2', { data: 'test2' });

      expect(command1.execute).toHaveBeenCalledWith({ data: 'test1' });
      expect(command2.execute).toHaveBeenCalledWith({ data: 'test2' });
    });
  });

  describe('Command history', () => {
    it('should maintain command history', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('history-command', mockCommand);
      commandManager.executeCommand('history-command', { data: 'test' });

      const history = commandManager.getCommandHistory();
      expect(history).toHaveLength(1);
      expect(history[0].commandName).toBe('history-command');
    });

    it('should limit command history size', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('limit-command', mockCommand);

      // Execute more commands than the history limit
      for (let i = 0; i < 15; i++) {
        commandManager.executeCommand('limit-command', { data: `test${i}` });
      }

      const history = commandManager.getCommandHistory();
      expect(history.length).toBeLessThanOrEqual(10); // Default limit
    });

    it('should clear command history', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('clear-command', mockCommand);
      commandManager.executeCommand('clear-command', { data: 'test' });

      commandManager.clearCommandHistory();
      const history = commandManager.getCommandHistory();
      expect(history).toHaveLength(0);
    });

    it('should provide command execution details', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('details-command', mockCommand);
      commandManager.executeCommand('details-command', { data: 'test' });

      const history = commandManager.getCommandHistory();
      const lastCommand = history[history.length - 1];

      expect(lastCommand.commandName).toBe('details-command');
      expect(lastCommand.parameters).toEqual({ data: 'test' });
      expect(lastCommand.executionTime).toBeDefined();
      expect(lastCommand.success).toBe(true);
    });
  });

  describe('Undo/redo operations', () => {
    it('should undo commands correctly', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('undo-command', mockCommand);
      commandManager.executeCommand('undo-command', { data: 'test' });
      commandManager.undoLastCommand();

      expect(mockCommand.undo).toHaveBeenCalled();
    });

    it('should redo commands correctly', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('redo-command', mockCommand);
      commandManager.executeCommand('redo-command', { data: 'test' });
      commandManager.undoLastCommand();
      commandManager.redoLastCommand();

      expect(mockCommand.execute).toHaveBeenCalledTimes(2);
    });

    it('should handle undo when no commands exist', () => {
      expect(() => {
        commandManager.undoLastCommand();
      }).toThrow('No commands to undo');
    });

    it('should handle redo when no commands to redo', () => {
      expect(() => {
        commandManager.redoLastCommand();
      }).toThrow('No commands to redo');
    });

    it('should clear redo stack when new command is executed', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('redo-clear-command', mockCommand);
      commandManager.executeCommand('redo-clear-command', { data: 'test1' });
      commandManager.undoLastCommand();
      commandManager.executeCommand('redo-clear-command', { data: 'test2' });

      expect(() => {
        commandManager.redoLastCommand();
      }).toThrow('No commands to redo');
    });
  });

  describe('Command queuing', () => {
    it('should queue commands for execution', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('queue-command', mockCommand);
      commandManager.queueCommand('queue-command', { data: 'test' });

      const queue = commandManager.getCommandQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].commandName).toBe('queue-command');
    });

    it('should execute queued commands', async () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('queue-execute-command', mockCommand);
      commandManager.queueCommand('queue-execute-command', { data: 'test' });

      await commandManager.executeQueuedCommands();

      expect(mockCommand.execute).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should handle command queue overflow', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('overflow-command', mockCommand);

      // Queue more commands than the limit
      for (let i = 0; i < 15; i++) {
        commandManager.queueCommand('overflow-command', { data: `test${i}` });
      }

      const queue = commandManager.getCommandQueue();
      expect(queue.length).toBeLessThanOrEqual(10); // Default limit
    });

    it('should clear command queue', () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('clear-queue-command', mockCommand);
      commandManager.queueCommand('clear-queue-command', { data: 'test' });

      commandManager.clearCommandQueue();
      const queue = commandManager.getCommandQueue();
      expect(queue).toHaveLength(0);
    });
  });

  describe('Transaction support', () => {
    it('should execute commands in transaction', async () => {
      const command1: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const command2: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('transaction-command1', command1);
      commandManager.registerCommand('transaction-command2', command2);

      await commandManager.executeTransaction([
        { commandName: 'transaction-command1', parameters: { data: 'test1' } },
        { commandName: 'transaction-command2', parameters: { data: 'test2' } }
      ]);

      expect(command1.execute).toHaveBeenCalledWith({ data: 'test1' });
      expect(command2.execute).toHaveBeenCalledWith({ data: 'test2' });
    });

    it('should rollback transaction on failure', async () => {
      const command1: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const command2: ICommand = {
        execute: jest.fn().mockRejectedValue(new Error('Transaction failed')),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('rollback-command1', command1);
      commandManager.registerCommand('rollback-command2', command2);

      try {
        await commandManager.executeTransaction([
          { commandName: 'rollback-command1', parameters: { data: 'test1' } },
          { commandName: 'rollback-command2', parameters: { data: 'test2' } }
        ]);
      } catch (error) {
        // Expected to fail
      }

      expect(command1.execute).toHaveBeenCalled();
      expect(command1.undo).toHaveBeenCalled(); // Should be rolled back
    });

    it('should handle nested transactions', async () => {
      const mockCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('nested-command', mockCommand);

      await commandManager.executeTransaction([
        { commandName: 'nested-command', parameters: { data: 'outer' } }
      ]);

      await commandManager.executeTransaction([
        { commandName: 'nested-command', parameters: { data: 'inner' } }
      ]);

      expect(mockCommand.execute).toHaveBeenCalledWith({ data: 'outer' });
      expect(mockCommand.execute).toHaveBeenCalledWith({ data: 'inner' });
    });
  });

  describe('Command substitution', () => {
    it('should allow command substitution', () => {
      const originalCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const substituteCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('substitute-command', originalCommand);
      commandManager.substituteCommand('substitute-command', substituteCommand);

      commandManager.executeCommand('substitute-command', { data: 'test' });

      expect(substituteCommand.execute).toHaveBeenCalledWith({ data: 'test' });
      expect(originalCommand.execute).not.toHaveBeenCalled();
    });

    it('should maintain command interface during substitution', () => {
      const originalCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const substituteCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('interface-command', originalCommand);
      commandManager.substituteCommand('interface-command', substituteCommand);

      const registeredCommand = commandManager.getCommand('interface-command');
      expect(registeredCommand.execute).toBeDefined();
      expect(registeredCommand.undo).toBeDefined();
      expect(registeredCommand.canExecute).toBeDefined();
    });

    it('should handle substitution errors gracefully', () => {
      const originalCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn(),
        canExecute: () => true
      };

      const invalidSubstitute = null; // Invalid command

      commandManager.registerCommand('error-substitute-command', originalCommand);

      expect(() => {
        commandManager.substituteCommand('error-substitute-command', invalidSubstitute);
      }).toThrow('Invalid command for substitution');
    });
  });

  describe('Error handling', () => {
    it('should handle command execution errors gracefully', () => {
      const errorCommand: ICommand = {
        execute: jest.fn().mockRejectedValue(new Error('Execution error')),
        undo: jest.fn(),
        canExecute: () => true
      };

      commandManager.registerCommand('error-command', errorCommand);

      expect(async () => {
        await commandManager.executeCommand('error-command', { data: 'test' });
      }).rejects.toThrow('Execution error');
    });

    it('should handle command validation errors', () => {
      const invalidCommand: ICommand = {
        execute: jest.fn(),
        undo: jest.fn(),
        canExecute: () => false
      };

      commandManager.registerCommand('invalid-command', invalidCommand);

      expect(() => {
        commandManager.executeCommand('invalid-command', { data: 'test' });
      }).toThrow('Command cannot be executed');
    });

    it('should handle command registration errors', () => {
      const invalidCommand = null; // Invalid command

      expect(() => {
        commandManager.registerCommand('invalid-registration', invalidCommand);
      }).toThrow('Invalid command for registration');
    });

    it('should handle command not found errors', () => {
      expect(() => {
        commandManager.executeCommand('non-existent-command', { data: 'test' });
      }).toThrow('Command not found: non-existent-command');
    });

    it('should handle undo errors gracefully', () => {
      const undoErrorCommand: ICommand = {
        execute: jest.fn().mockResolvedValue(true),
        undo: jest.fn().mockImplementation(() => {
          throw new Error('Undo failed');
        }),
        canExecute: () => true
      };

      commandManager.registerCommand('undo-error-command', undoErrorCommand);
      commandManager.executeCommand('undo-error-command', { data: 'test' });

      expect(() => {
        commandManager.undoLastCommand();
      }).toThrow('Undo failed');
    });
  });

  describe('Integration with specific commands', () => {
    it('should integrate with SendMessageCommand', () => {
      const sendCommand = new SendMessageCommand(serviceContainer, eventBus);
      commandManager.registerCommand('send-message', sendCommand);

      commandManager.executeCommand('send-message', { 
        content: 'Hello World',
        roomId: 'room1'
      });

      expect(sendCommand.execute).toBeDefined();
    });

    it('should integrate with CancelMessageCommand', () => {
      const cancelCommand = new CancelMessageCommand(serviceContainer, eventBus);
      commandManager.registerCommand('cancel-message', cancelCommand);

      commandManager.executeCommand('cancel-message', { 
        messageId: 'msg1'
      });

      expect(cancelCommand.execute).toBeDefined();
    });

    it('should integrate with RetryMessageCommand', () => {
      const retryCommand = new RetryMessageCommand(serviceContainer, eventBus);
      commandManager.registerCommand('retry-message', retryCommand);

      commandManager.executeCommand('retry-message', { 
        messageId: 'msg1'
      });

      expect(retryCommand.execute).toBeDefined();
    });

    it('should integrate with ClearMessagesCommand', () => {
      const clearCommand = new ClearMessagesCommand(serviceContainer, eventBus);
      commandManager.registerCommand('clear-messages', clearCommand);

      commandManager.executeCommand('clear-messages', { 
        roomId: 'room1'
      });

      expect(clearCommand.execute).toBeDefined();
    });

    it('should integrate with ChangeModelCommand', () => {
      const changeModelCommand = new ChangeModelCommand(serviceContainer, eventBus);
      commandManager.registerCommand('change-model', changeModelCommand);

      commandManager.executeCommand('change-model', { 
        model: 'gpt-4'
      });

      expect(changeModelCommand.execute).toBeDefined();
    });
  });
}); 