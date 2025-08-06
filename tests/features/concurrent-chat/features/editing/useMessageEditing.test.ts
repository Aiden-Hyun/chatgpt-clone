import { renderHook, act } from '@testing-library/react';
import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EditingService } from '../../../../src/features/concurrent-chat/features/editing/EditingService';
import { useMessageEditing } from '../../../../src/features/concurrent-chat/features/editing/useMessageEditing';
import { IMessageProcessor } from '../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

// Mock message processor
class MockMessageProcessor implements IMessageProcessor {
  async processMessage(message: string, options?: any): Promise<string> {
    return `Processed: ${message}`;
  }
}

describe('useMessageEditing', () => {
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
  let editingService: EditingService;
  let mockMessageProcessor: MockMessageProcessor;

  beforeEach(() => {
    eventBus = new EventBus();
    serviceContainer = new ServiceContainer();
    mockMessageProcessor = new MockMessageProcessor();
    
    editingService = new EditingService(
      eventBus,
      serviceContainer,
      mockMessageProcessor
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Editing State Management', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      expect(result.current.isEditing).toBe(false);
      expect(result.current.editHistory).toEqual([]);
      expect(result.current.currentEdit).toBeNull();
      expect(result.current.editedContent).toBe('');
    });

    it('should update editing state when editing starts', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.currentEdit?.messageId).toBe('msg_123');
      expect(result.current.editedContent).toBe('Original content');
    });

    it('should update edited content', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Edited content');
      });

      expect(result.current.editedContent).toBe('Edited content');
    });

    it('should handle editing state transitions', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      expect(result.current.isEditing).toBe(false);

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
      });

      expect(result.current.isEditing).toBe(true);

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe('Edit Mode Controls', () => {
    it('should start editing mode', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
      });

      expect(result.current.isEditing).toBe(true);
      expect(result.current.currentEdit?.messageId).toBe('msg_123');
    });

    it('should exit editing mode', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.exitEditMode();
      });

      expect(result.current.isEditing).toBe(false);
      expect(result.current.currentEdit).toBeNull();
    });

    it('should toggle editing mode', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.toggleEditMode('msg_123', 'Original content');
      });

      expect(result.current.isEditing).toBe(true);

      act(() => {
        result.current.toggleEditMode('msg_123', 'Original content');
      });

      expect(result.current.isEditing).toBe(false);
    });

    it('should handle multiple edit sessions', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content 1');
      });

      expect(result.current.currentEdit?.messageId).toBe('msg_123');

      act(() => {
        result.current.startEditing('msg_456', 'Original content 2');
      });

      expect(result.current.currentEdit?.messageId).toBe('msg_456');
    });
  });

  describe('Version History', () => {
    it('should track version history', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Version 1');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      act(() => {
        result.current.startEditing('msg_123', 'Version 1');
        result.current.updateContent('Version 2');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(result.current.versionHistory).toHaveLength(3); // Original + 2 versions
      expect(result.current.versionHistory[0].content).toBe('Original content');
      expect(result.current.versionHistory[1].content).toBe('Version 1');
      expect(result.current.versionHistory[2].content).toBe('Version 2');
    });

    it('should revert to previous version', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Version 1');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      act(() => {
        result.current.startEditing('msg_123', 'Version 1');
        result.current.updateContent('Version 2');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      act(() => {
        result.current.revertToVersion(1);
      });

      expect(result.current.editedContent).toBe('Version 1');
    });

    it('should get version by index', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Version 1');
      });

      const version = result.current.getVersionByIndex(0);
      expect(version?.content).toBe('Original content');
    });

    it('should clear version history', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Version 1');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(result.current.versionHistory).toHaveLength(2);

      act(() => {
        result.current.clearVersionHistory();
      });

      expect(result.current.versionHistory).toHaveLength(0);
    });
  });

  describe('Plugin Lifecycle Integration', () => {
    it('should integrate with plugin lifecycle', () => {
      const plugin = {
        name: 'test-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };

      editingService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageEditing(editingService));

      expect(result.current.plugins).toContain(plugin);
    });

    it('should notify plugins of editing events', async () => {
      const plugin = {
        name: 'test-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };

      editingService.registerPlugin(plugin);
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Edited content');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      expect(plugin.onEditStart).toHaveBeenCalled();
      expect(plugin.onEditSave).toHaveBeenCalled();
    });

    it('should handle plugin lifecycle events', () => {
      const plugin = {
        name: 'test-plugin',
        onMount: jest.fn(),
        onUnmount: jest.fn()
      };

      const { result, unmount } = renderHook(() => useMessageEditing(editingService));
      
      editingService.registerPlugin(plugin);

      expect(plugin.onMount).toHaveBeenCalled();

      unmount();

      expect(plugin.onUnmount).toHaveBeenCalled();
    });
  });

  describe('Command Integration', () => {
    it('should integrate with command pattern', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      const commandResult = await act(async () => {
        return result.current.executeCommand('test-command', 'Test data');
      });

      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(commandResult).toBe('Command result');
    });

    it('should support command history', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
      });

      const commandHistory = result.current.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };

      act(() => {
        result.current.registerCommand('test-command', command);
      });

      await act(async () => {
        await result.current.executeCommand('test-command', 'Test data');
        await result.current.undoLastCommand();
      });

      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('Collaborative Editing', () => {
    it('should support collaborative editing', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content', 'user1');
        result.current.updateContent('Edit by user1');
      });

      expect(result.current.currentEdit?.userId).toBe('user1');
      expect(result.current.editedContent).toBe('Edit by user1');
    });

    it('should detect edit conflicts', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content', 'user1');
        result.current.updateContent('Edit by user1');
      });

      act(() => {
        result.current.startEditing('msg_123', 'Original content', 'user2');
        result.current.updateContent('Edit by user2');
      });

      const conflicts = result.current.detectConflicts('msg_123');
      expect(conflicts).toHaveLength(2);
      expect(conflicts[0].userId).toBe('user1');
      expect(conflicts[1].userId).toBe('user2');
    });

    it('should merge collaborative edits', async () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content', 'user1');
        result.current.updateContent('Edit by user1');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      act(() => {
        result.current.startEditing('msg_123', 'Edit by user1', 'user2');
        result.current.updateContent('Edit by user1 + user2');
      });

      await act(async () => {
        await result.current.saveEdit();
      });

      const mergedContent = result.current.mergeEdits('msg_123');
      expect(mergedContent).toContain('Edit by user1');
      expect(mergedContent).toContain('user2');
    });
  });

  describe('Edit Validation', () => {
    it('should validate edit content', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('');
      });

      const validation = result.current.validateEdit();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Content cannot be empty');
    });

    it('should validate edit length', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      const longContent = 'a'.repeat(10001); // Exceeds 10000 character limit

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent(longContent);
      });

      const validation = result.current.validateEdit();
      expect(validation.isValid).toBe(false);
      expect(validation.errors).toContain('Content exceeds maximum length');
    });

    it('should pass validation for valid content', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      act(() => {
        result.current.startEditing('msg_123', 'Original content');
        result.current.updateContent('Valid edited content');
      });

      const validation = result.current.validateEdit();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      // Hook should only handle editing state and controls
      expect(typeof result.current.startEditing).toBe('function');
      expect(typeof result.current.saveEdit).toBe('function');
      expect(typeof result.current.cancelEdit).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };

      editingService.registerPlugin(newPlugin);

      expect(result.current.plugins).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any editing service should be substitutable
      const alternativeService = new EditingService(
        eventBus,
        serviceContainer,
        mockMessageProcessor
      );

      const { result } = renderHook(() => useMessageEditing(alternativeService));

      expect(typeof result.current.startEditing).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      const { result } = renderHook(() => useMessageEditing(editingService));

      // Should depend on focused interfaces, not large ones
      expect(result.current).toHaveProperty('startEditing');
      expect(result.current).toHaveProperty('saveEdit');
      expect(result.current).toHaveProperty('cancelEdit');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (EditingService) not concretions
      const { result } = renderHook(() => useMessageEditing(editingService));

      expect(result.current.editingService).toBe(editingService);
      expect(typeof result.current.editingService.startEditing).toBe('function');
    });
  });
}); 