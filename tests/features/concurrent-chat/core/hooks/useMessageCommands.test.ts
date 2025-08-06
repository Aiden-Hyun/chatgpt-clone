import { act, renderHook } from '@testing-library/react-hooks';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { useMessageCommands } from '../../../../../src/features/concurrent-chat/core/hooks/useMessageCommands';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';

describe('useMessageCommands', () => {
  let mockEventBus: jest.Mocked<EventBus>;
  let mockCommand: jest.Mocked<ICommand>;

  beforeEach(() => {
    mockEventBus = {
      subscribe: jest.fn(),
      publish: jest.fn(),
      unsubscribe: jest.fn(),
      unsubscribeById: jest.fn(),
      hasSubscribers: jest.fn(),
      getEventHistory: jest.fn(),
    } as any;

    mockCommand = {
      execute: jest.fn().mockResolvedValue({ success: true }),
      undo: jest.fn().mockResolvedValue({ success: true }),
      canUndo: jest.fn().mockReturnValue(true),
      getDescription: jest.fn().mockReturnValue('Test command'),
      getTimestamp: jest.fn().mockReturnValue(Date.now()),
      getId: jest.fn().mockReturnValue('cmd-123'),
    } as any;
  });

  describe('hook initialization', () => {
    it('should initialize with empty command history', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      expect(result.current.commandHistory).toEqual([]);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(false);
    });

    it('should initialize with provided dependencies', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      expect(result.current.eventBus).toBe(mockEventBus);
    });

    it('should subscribe to command events', () => {
      renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      expect(mockEventBus.subscribe).toHaveBeenCalled();
    });
  });

  describe('command execution', () => {
    it('should execute command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const executionResult = await result.current.executeCommand(mockCommand);
        expect(executionResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toContain(mockCommand);
      expect(result.current.canUndo).toBe(true);
    });

    it('should handle command execution errors', async () => {
      mockCommand.execute.mockRejectedValue(new Error('Execution failed'));
      
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const executionResult = await result.current.executeCommand(mockCommand);
        expect(executionResult.success).toBe(false);
      });

      expect(result.current.commandHistory).not.toContain(mockCommand);
      expect(result.current.canUndo).toBe(false);
    });

    it('should publish command executed event', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('command.executed', {
        command: mockCommand,
        result: { success: true }
      });
    });

    it('should handle null command', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const executionResult = await result.current.executeCommand(null as any);
        expect(executionResult.success).toBe(false);
      });

      expect(result.current.commandHistory).toEqual([]);
    });

    it('should handle undefined command', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const executionResult = await result.current.executeCommand(undefined as any);
        expect(executionResult.success).toBe(false);
      });

      expect(result.current.commandHistory).toEqual([]);
    });
  });

  describe('command history management', () => {
    it('should add commands to history', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      expect(result.current.commandHistory).toHaveLength(1);
      expect(result.current.commandHistory[0]).toBe(mockCommand);
    });

    it('should limit history size', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus,
        maxHistorySize: 2
      }));

      const command1 = { ...mockCommand, getId: () => 'cmd-1' };
      const command2 = { ...mockCommand, getId: () => 'cmd-2' };
      const command3 = { ...mockCommand, getId: () => 'cmd-3' };

      await act(async () => {
        await result.current.executeCommand(command1);
        await result.current.executeCommand(command2);
        await result.current.executeCommand(command3);
      });

      expect(result.current.commandHistory).toHaveLength(2);
      expect(result.current.commandHistory[0]).toBe(command2);
      expect(result.current.commandHistory[1]).toBe(command3);
    });

    it('should provide command history', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const history = result.current.getCommandHistory();
      expect(history).toEqual([]);
    });

    it('should clear command history', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      act(() => {
        result.current.clearCommandHistory();
      });

      expect(result.current.commandHistory).toEqual([]);
      expect(result.current.canUndo).toBe(false);
    });
  });

  describe('undo functionality', () => {
    it('should undo last command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      await act(async () => {
        const undoResult = await result.current.undoLastCommand();
        expect(undoResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toEqual([]);
      expect(result.current.canUndo).toBe(false);
    });

    it('should handle undo errors', async () => {
      mockCommand.undo.mockRejectedValue(new Error('Undo failed'));
      
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      await act(async () => {
        const undoResult = await result.current.undoLastCommand();
        expect(undoResult.success).toBe(false);
      });

      expect(result.current.commandHistory).toContain(mockCommand);
    });

    it('should handle empty history for undo', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const undoResult = await result.current.undoLastCommand();
        expect(undoResult.success).toBe(false);
      });
    });

    it('should check if command can be undone', async () => {
      mockCommand.canUndo.mockReturnValue(false);
      
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      expect(result.current.canUndo).toBe(false);
    });

    it('should publish command undone event', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
        await result.current.undoLastCommand();
      });

      expect(mockEventBus.publish).toHaveBeenCalledWith('command.undone', {
        command: mockCommand,
        result: { success: true }
      });
    });
  });

  describe('redo functionality', () => {
    it('should redo command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
        await result.current.undoLastCommand();
        const redoResult = await result.current.redoLastCommand();
        expect(redoResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toContain(mockCommand);
    });

    it('should handle redo errors', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
        await result.current.undoLastCommand();
      });

      mockCommand.execute.mockRejectedValue(new Error('Redo failed'));

      await act(async () => {
        const redoResult = await result.current.redoLastCommand();
        expect(redoResult.success).toBe(false);
      });
    });

    it('should handle no commands to redo', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const redoResult = await result.current.redoLastCommand();
        expect(redoResult.success).toBe(false);
      });
    });

    it('should update redo state correctly', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      expect(result.current.canRedo).toBe(false);

      await act(async () => {
        await result.current.undoLastCommand();
      });

      expect(result.current.canRedo).toBe(true);
    });
  });

  describe('command validation', () => {
    it('should validate command before execution', async () => {
      const invalidCommand = {
        execute: jest.fn(),
        undo: jest.fn(),
        canUndo: jest.fn(),
        getDescription: jest.fn(),
        getTimestamp: jest.fn(),
        getId: jest.fn(),
      } as any;

      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const executionResult = await result.current.executeCommand(invalidCommand);
        expect(executionResult.success).toBe(false);
      });
    });

    it('should validate command interface compliance', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const isValid = result.current.validateCommand(mockCommand);
      expect(isValid).toBe(true);
    });

    it('should reject invalid commands', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const invalidCommand = { someProperty: 'value' } as any;
      const isValid = result.current.validateCommand(invalidCommand);
      expect(isValid).toBe(false);
    });
  });

  describe('command queue management', () => {
    it('should queue commands when executing multiple', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const command1 = { ...mockCommand, getId: () => 'cmd-1' };
      const command2 = { ...mockCommand, getId: () => 'cmd-2' };

      await act(async () => {
        const promises = [
          result.current.executeCommand(command1),
          result.current.executeCommand(command2)
        ];
        await Promise.all(promises);
      });

      expect(result.current.commandHistory).toHaveLength(2);
    });

    it('should handle command queue errors', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const errorCommand = {
        ...mockCommand,
        execute: jest.fn().mockRejectedValue(new Error('Queue error'))
      };

      await act(async () => {
        const executionResult = await result.current.executeCommand(errorCommand);
        expect(executionResult.success).toBe(false);
      });
    });
  });

  describe('transaction support', () => {
    it('should support command transactions', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const command1 = { ...mockCommand, getId: () => 'cmd-1' };
      const command2 = { ...mockCommand, getId: () => 'cmd-2' };

      await act(async () => {
        const transactionResult = await result.current.executeTransaction([command1, command2]);
        expect(transactionResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toHaveLength(2);
    });

    it('should rollback transaction on error', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const command1 = { ...mockCommand, getId: () => 'cmd-1' };
      const errorCommand = {
        ...mockCommand,
        getId: () => 'cmd-error',
        execute: jest.fn().mockRejectedValue(new Error('Transaction error'))
      };

      await act(async () => {
        const transactionResult = await result.current.executeTransaction([command1, errorCommand]);
        expect(transactionResult.success).toBe(false);
      });

      expect(result.current.commandHistory).toEqual([]);
    });

    it('should handle empty transaction', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      await act(async () => {
        const transactionResult = await result.current.executeTransaction([]);
        expect(transactionResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toEqual([]);
    });
  });

  describe('performance considerations', () => {
    it('should handle many commands efficiently', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus,
        maxHistorySize: 1000
      }));

      const startTime = Date.now();

      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, i) => {
          const command = { ...mockCommand, getId: () => `cmd-${i}` };
          return result.current.executeCommand(command);
        });
        await Promise.all(promises);
      });

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should handle large history efficiently', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus,
        maxHistorySize: 10000
      }));

      const startTime = Date.now();

      act(() => {
        for (let i = 0; i < 1000; i++) {
          result.current.commandHistory.push({ ...mockCommand, getId: () => `cmd-${i}` });
        }
      });

      const history = result.current.getCommandHistory();
      const endTime = Date.now();

      expect(history.length).toBe(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe('error handling', () => {
    it('should handle event bus errors', () => {
      mockEventBus.subscribe.mockImplementation(() => {
        throw new Error('Subscription failed');
      });

      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      expect(result.current.error).toBeDefined();
    });

    it('should handle command execution errors gracefully', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const errorCommand = {
        ...mockCommand,
        execute: jest.fn().mockImplementation(() => {
          throw new Error('Execution failed');
        })
      };

      await act(async () => {
        const executionResult = await result.current.executeCommand(errorCommand);
        expect(executionResult.success).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should clear errors when appropriate', () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      act(() => {
        result.current.error = new Error('Test error');
      });

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('cleanup and unmounting', () => {
    it('should cleanup on unmount', () => {
      const { unmount } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      unmount();

      expect(mockEventBus.unsubscribe).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', () => {
      mockEventBus.unsubscribe.mockImplementation(() => {
        throw new Error('Cleanup failed');
      });

      const { unmount } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      // Should not throw
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete command workflow', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      // Execute command
      await act(async () => {
        const executionResult = await result.current.executeCommand(mockCommand);
        expect(executionResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toContain(mockCommand);
      expect(result.current.canUndo).toBe(true);

      // Undo command
      await act(async () => {
        const undoResult = await result.current.undoLastCommand();
        expect(undoResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toEqual([]);
      expect(result.current.canUndo).toBe(false);
      expect(result.current.canRedo).toBe(true);

      // Redo command
      await act(async () => {
        const redoResult = await result.current.redoLastCommand();
        expect(redoResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toContain(mockCommand);
      expect(result.current.canUndo).toBe(true);
      expect(result.current.canRedo).toBe(false);
    });

    it('should handle command transaction workflow', async () => {
      const { result } = renderHook(() => useMessageCommands({
        eventBus: mockEventBus
      }));

      const command1 = { ...mockCommand, getId: () => 'cmd-1' };
      const command2 = { ...mockCommand, getId: () => 'cmd-2' };
      const command3 = { ...mockCommand, getId: () => 'cmd-3' };

      // Execute transaction
      await act(async () => {
        const transactionResult = await result.current.executeTransaction([command1, command2, command3]);
        expect(transactionResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toHaveLength(3);

      // Undo transaction
      await act(async () => {
        const undoResult = await result.current.undoLastCommand();
        expect(undoResult.success).toBe(true);
      });

      expect(result.current.commandHistory).toHaveLength(2);
    });
  });
}); 