import { EventBus } from '../../../../src/features/concurrent-chat/core/events/EventBus';
import { ServiceContainer } from '../../../../src/features/concurrent-chat/core/container/ServiceContainer';
import { EditingService } from '../../../../src/features/concurrent-chat/features/editing/EditingService';
import { IMessageProcessor } from '../../../../src/features/concurrent-chat/core/types/interfaces/IMessageProcessor';

// Mock message processor
class MockMessageProcessor implements IMessageProcessor {
  async processMessage(message: string, options?: any): Promise<string> {
    return `Processed: ${message}`;
  }
}

describe('EditingService', () => {
  let editingService: EditingService;
  let eventBus: EventBus;
  let serviceContainer: ServiceContainer;
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

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      expect(editingService).toBeDefined();
      expect(editingService.getEditHistory()).toEqual([]);
      expect(editingService.getCurrentEdit()).toBeNull();
    });

    it('should register with service container', () => {
      expect(serviceContainer.get('editingService')).toBe(editingService);
    });

    it('should subscribe to editing events', () => {
      const subscribeSpy = jest.spyOn(eventBus, 'subscribe');
      new EditingService(eventBus, serviceContainer, mockMessageProcessor);
      
      expect(subscribeSpy).toHaveBeenCalledWith('editing:start', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('editing:save', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('editing:cancel', expect.any(Function));
      expect(subscribeSpy).toHaveBeenCalledWith('editing:error', expect.any(Function));
    });
  });

  describe('Message Editing Logic', () => {
    it('should start editing a message', () => {
      const messageId = 'msg_123';
      const originalContent = 'Original message content';
      
      editingService.startEditing(messageId, originalContent);
      
      const currentEdit = editingService.getCurrentEdit();
      expect(currentEdit).toBeDefined();
      expect(currentEdit?.messageId).toBe(messageId);
      expect(currentEdit?.originalContent).toBe(originalContent);
      expect(currentEdit?.editedContent).toBe(originalContent);
    });

    it('should update edited content', () => {
      const messageId = 'msg_123';
      const originalContent = 'Original message content';
      const editedContent = 'Edited message content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent(editedContent);
      
      const currentEdit = editingService.getCurrentEdit();
      expect(currentEdit?.editedContent).toBe(editedContent);
    });

    it('should save edited message', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original message content';
      const editedContent = 'Edited message content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent(editedContent);
      
      const result = await editingService.saveEdit();
      
      expect(result).toBeDefined();
      expect(result.messageId).toBe(messageId);
      expect(result.originalContent).toBe(originalContent);
      expect(result.editedContent).toBe(editedContent);
      
      const editHistory = editingService.getEditHistory();
      expect(editHistory).toHaveLength(1);
      expect(editHistory[0]).toEqual(result);
    });

    it('should cancel editing', () => {
      const messageId = 'msg_123';
      const originalContent = 'Original message content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent('Edited content');
      
      editingService.cancelEdit();
      
      const currentEdit = editingService.getCurrentEdit();
      expect(currentEdit).toBeNull();
    });

    it('should handle editing errors', async () => {
      const errorProcessor = {
        async processMessage() {
          throw new Error('Processing error');
        }
      };
      
      const errorEditingService = new EditingService(
        eventBus,
        serviceContainer,
        errorProcessor
      );
      
      errorEditingService.startEditing('msg_123', 'Original content');
      errorEditingService.updateContent('Edited content');
      
      await expect(errorEditingService.saveEdit()).rejects.toThrow('Processing error');
    });
  });

  describe('Edit History and Versioning', () => {
    it('should track edit history', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent('Edit 1');
      await editingService.saveEdit();
      
      editingService.startEditing(messageId, 'Edit 1');
      editingService.updateContent('Edit 2');
      await editingService.saveEdit();
      
      const history = editingService.getEditHistory();
      expect(history).toHaveLength(2);
      expect(history[0].editedContent).toBe('Edit 1');
      expect(history[1].editedContent).toBe('Edit 2');
    });

    it('should create version history', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent('Version 1');
      await editingService.saveEdit();
      
      editingService.startEditing(messageId, 'Version 1');
      editingService.updateContent('Version 2');
      await editingService.saveEdit();
      
      const versions = editingService.getVersionHistory(messageId);
      expect(versions).toHaveLength(3); // Original + 2 edits
      expect(versions[0].content).toBe(originalContent);
      expect(versions[1].content).toBe('Version 1');
      expect(versions[2].content).toBe('Version 2');
    });

    it('should revert to previous version', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent);
      editingService.updateContent('Version 1');
      await editingService.saveEdit();
      
      editingService.startEditing(messageId, 'Version 1');
      editingService.updateContent('Version 2');
      await editingService.saveEdit();
      
      const revertedContent = editingService.revertToVersion(messageId, 1);
      expect(revertedContent).toBe('Version 1');
    });

    it('should limit edit history size', async () => {
      const maxHistorySize = 3;
      editingService.setMaxHistorySize(maxHistorySize);
      
      for (let i = 0; i < maxHistorySize + 2; i++) {
        editingService.startEditing(`msg_${i}`, `Original ${i}`);
        editingService.updateContent(`Edit ${i}`);
        await editingService.saveEdit();
      }
      
      const history = editingService.getEditHistory();
      expect(history).toHaveLength(maxHistorySize);
      expect(history[0].messageId).toBe('msg_2'); // Oldest should be removed
    });

    it('should clear edit history', async () => {
      editingService.startEditing('msg_123', 'Original content');
      editingService.updateContent('Edited content');
      await editingService.saveEdit();
      
      expect(editingService.getEditHistory()).toHaveLength(1);
      
      editingService.clearHistory();
      
      expect(editingService.getEditHistory()).toHaveLength(0);
    });
  });

  describe('Collaborative Editing Support', () => {
    it('should support multiple editors', () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent, 'user1');
      editingService.updateContent('Edit by user1');
      
      editingService.startEditing(messageId, originalContent, 'user2');
      editingService.updateContent('Edit by user2');
      
      const user1Edit = editingService.getCurrentEdit('user1');
      const user2Edit = editingService.getCurrentEdit('user2');
      
      expect(user1Edit?.editedContent).toBe('Edit by user1');
      expect(user2Edit?.editedContent).toBe('Edit by user2');
    });

    it('should detect edit conflicts', () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent, 'user1');
      editingService.updateContent('Edit by user1');
      
      editingService.startEditing(messageId, originalContent, 'user2');
      editingService.updateContent('Edit by user2');
      
      const conflicts = editingService.detectConflicts(messageId);
      expect(conflicts).toHaveLength(2);
      expect(conflicts[0].userId).toBe('user1');
      expect(conflicts[1].userId).toBe('user2');
    });

    it('should merge collaborative edits', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent, 'user1');
      editingService.updateContent('Edit by user1');
      await editingService.saveEdit();
      
      editingService.startEditing(messageId, 'Edit by user1', 'user2');
      editingService.updateContent('Edit by user1 + user2');
      await editingService.saveEdit();
      
      const mergedContent = editingService.mergeEdits(messageId);
      expect(mergedContent).toContain('Edit by user1');
      expect(mergedContent).toContain('user2');
    });

    it('should track edit ownership', async () => {
      const messageId = 'msg_123';
      const originalContent = 'Original content';
      
      editingService.startEditing(messageId, originalContent, 'user1');
      editingService.updateContent('Edit by user1');
      await editingService.saveEdit();
      
      const history = editingService.getEditHistory();
      expect(history[0].userId).toBe('user1');
      expect(history[0].editedContent).toBe('Edit by user1');
    });
  });

  describe('Plugin Integration', () => {
    it('should integrate with plugin system', () => {
      const plugin = {
        name: 'test-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };
      
      editingService.registerPlugin(plugin);
      
      expect(editingService.getPlugins()).toContain(plugin);
    });

    it('should notify plugins of editing events', async () => {
      const plugin = {
        name: 'test-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };
      
      editingService.registerPlugin(plugin);
      
      editingService.startEditing('msg_123', 'Original content');
      editingService.updateContent('Edited content');
      await editingService.saveEdit();
      
      expect(plugin.onEditStart).toHaveBeenCalled();
      expect(plugin.onEditSave).toHaveBeenCalled();
    });

    it('should handle plugin errors gracefully', async () => {
      const errorPlugin = {
        name: 'error-plugin',
        onEditStart: () => { throw new Error('Plugin error'); },
        onEditSave: jest.fn()
      };
      
      editingService.registerPlugin(errorPlugin);
      
      // Should not throw error
      editingService.startEditing('msg_123', 'Original content');
      expect(errorPlugin.onEditSave).not.toHaveBeenCalled();
    });
  });

  describe('Command Pattern Integration', () => {
    it('should integrate with command pattern', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      editingService.registerCommand('test-command', command);
      
      const result = await editingService.executeCommand('test-command', 'Test data');
      
      expect(command.execute).toHaveBeenCalledWith('Test data');
      expect(result).toBe('Command result');
    });

    it('should support command history', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      editingService.registerCommand('test-command', command);
      
      await editingService.executeCommand('test-command', 'Test data');
      
      const commandHistory = editingService.getCommandHistory();
      expect(commandHistory).toHaveLength(1);
      expect(commandHistory[0].commandName).toBe('test-command');
    });

    it('should support command undo', async () => {
      const command = {
        execute: jest.fn().mockResolvedValue('Command result'),
        canUndo: () => true,
        undo: jest.fn()
      };
      
      editingService.registerCommand('test-command', command);
      
      await editingService.executeCommand('test-command', 'Test data');
      await editingService.undoLastCommand();
      
      expect(command.undo).toHaveBeenCalled();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      // EditingService should only handle editing logic
      expect(typeof editingService.startEditing).toBe('function');
      expect(typeof editingService.saveEdit).toBe('function');
      expect(typeof editingService.getEditHistory).toBe('function');
    });

    it('should follow Open/Closed Principle', () => {
      // Should be open for extension (new plugins) but closed for modification
      const newPlugin = {
        name: 'new-plugin',
        onEditStart: jest.fn(),
        onEditSave: jest.fn(),
        onEditCancel: jest.fn()
      };
      
      editingService.registerPlugin(newPlugin);
      
      expect(editingService.getPlugins()).toContain(newPlugin);
    });

    it('should follow Liskov Substitution Principle', () => {
      // Any IMessageProcessor implementation should be substitutable
      const alternativeProcessor = {
        async processMessage(message: string, options?: any): Promise<string> {
          return `Alternative: ${message}`;
        }
      };
      
      const alternativeService = new EditingService(
        eventBus,
        serviceContainer,
        alternativeProcessor
      );
      
      expect(typeof alternativeService.startEditing).toBe('function');
    });

    it('should follow Interface Segregation Principle', () => {
      // Should depend on focused interfaces, not large ones
      expect(typeof mockMessageProcessor.processMessage).toBe('function');
    });

    it('should follow Dependency Inversion Principle', () => {
      // Should depend on abstractions (IMessageProcessor) not concretions
      expect(editingService.messageProcessor).toBe(mockMessageProcessor);
      expect(typeof editingService.messageProcessor.processMessage).toBe('function');
    });
  });
}); 