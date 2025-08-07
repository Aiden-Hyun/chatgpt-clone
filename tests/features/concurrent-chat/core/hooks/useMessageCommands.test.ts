import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { useMessageCommands } from '../../../../../src/features/concurrent-chat/core/hooks/useMessageCommands';
import { ICommand } from '../../../../../src/features/concurrent-chat/core/types/interfaces/ICommand';

describe('useMessageCommands', () => {
  let mockEventBus: EventBus;
  let mockServiceContainer: ServiceContainer;
  let mockCommand: jest.Mocked<ICommand>;

  beforeEach(() => {
    // Create real instances
    mockEventBus = new EventBus();
    mockServiceContainer = new ServiceContainer();

    mockCommand = {
      execute: jest.fn().mockResolvedValue(undefined),
      canUndo: jest.fn().mockReturnValue(true),
      undo: jest.fn().mockResolvedValue(undefined),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      expect(result.current.isExecuting).toBe(false);
      expect(result.current.lastExecutedCommand).toBeNull();
    });
  });

  describe('command execution', () => {
    it('should execute a command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      expect(mockCommand.execute).toHaveBeenCalled();
    });

    it('should handle command execution errors', async () => {
      const error = new Error('Command failed');
      mockCommand.execute.mockRejectedValue(error);

      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await expect(result.current.executeCommand(mockCommand)).rejects.toThrow('Command failed');
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe('undo functionality', () => {
    it('should undo the last command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      // First execute a command
      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      // Then undo it
      await act(async () => {
        await result.current.undoLastCommand();
      });

      expect(mockCommand.undo).toHaveBeenCalled();
    });

    it('should handle undo when no command is available', async () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await expect(result.current.undoLastCommand()).rejects.toThrow('No command available to undo');
      });
    });
  });

  describe('redo functionality', () => {
    it('should redo the last undone command successfully', async () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      // First execute a command
      await act(async () => {
        await result.current.executeCommand(mockCommand);
      });

      // Then undo it
      await act(async () => {
        await result.current.undoLastCommand();
      });

      // Then redo it
      await act(async () => {
        await result.current.redoLastCommand();
      });

      expect(mockCommand.execute).toHaveBeenCalledTimes(2); // Once for execute, once for redo
    });

    it('should handle redo when no command is available', async () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await expect(result.current.redoLastCommand()).rejects.toThrow('No command available to redo');
      });
    });
  });

  describe('history management', () => {
    it('should clear command history', () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      act(() => {
        result.current.clearHistory();
      });

      // Should handle history clearing gracefully
      expect(result.current.getHistoryCount()).toBe(0);
    });

    it('should get command history', () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      const history = result.current.getCommandHistory();

      expect(history).toEqual([]);
    });

    it('should check if undo is available', () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      const canUndo = result.current.canUndo();

      expect(canUndo).toBe(false);
    });

    it('should check if redo is available', () => {
      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      const canRedo = result.current.canRedo();

      expect(canRedo).toBe(false);
    });
  });

  describe('batch command execution', () => {
    it('should execute multiple commands in sequence', async () => {
      const mockCommand2 = {
        ...mockCommand,
        execute: jest.fn().mockResolvedValue(undefined),
      };

      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.executeCommands([mockCommand, mockCommand2]);
      });

      expect(mockCommand.execute).toHaveBeenCalled();
      expect(mockCommand2.execute).toHaveBeenCalled();
    });

    it('should execute multiple commands in parallel', async () => {
      const mockCommand2 = {
        ...mockCommand,
        execute: jest.fn().mockResolvedValue(undefined),
      };

      const { result } = renderHook(() => useMessageCommands(mockEventBus, mockServiceContainer));

      await act(async () => {
        await result.current.executeCommandsParallel([mockCommand, mockCommand2]);
      });

      expect(mockCommand.execute).toHaveBeenCalled();
      expect(mockCommand2.execute).toHaveBeenCalled();
    });
  });
}); 