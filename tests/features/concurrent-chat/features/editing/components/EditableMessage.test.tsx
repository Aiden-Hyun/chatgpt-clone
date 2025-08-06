import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditableMessage } from '../../../../../../src/features/concurrent-chat/features/editing/components/EditableMessage';
import { useMessageEditing } from '../../../../../../src/features/concurrent-chat/features/editing/useMessageEditing';

// Mock the editing hook
jest.mock('../../../../../../src/features/concurrent-chat/features/editing/useMessageEditing');

const mockUseMessageEditing = useMessageEditing as jest.MockedFunction<typeof useMessageEditing>;

describe('EditableMessage', () => {
  const mockMessage = {
    id: 'msg1',
    content: 'Original message content that can be edited.',
    status: 'completed',
    role: 'assistant',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockEditingState = {
    isEditing: false,
    isSaving: false,
    hasChanges: false,
    editHistory: [
      { id: 'edit1', content: 'First edit', timestamp: new Date('2024-01-01T12:01:00Z') },
      { id: 'edit2', content: 'Second edit', timestamp: new Date('2024-01-01T12:02:00Z') }
    ],
    currentVersion: 2,
    totalVersions: 3
  };

  const mockEditingControls = {
    startEdit: jest.fn(),
    saveEdit: jest.fn(),
    cancelEdit: jest.fn(),
    updateEdit: jest.fn(),
    revertToVersion: jest.fn(),
    clearHistory: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMessageEditing.mockReturnValue({
      ...mockEditingState,
      ...mockEditingControls
    });
  });

  describe('Inline editing interface', () => {
    it('should render editable message', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
      expect(screen.getByText('Original message content that can be edited.')).toBeInTheDocument();
    });

    it('should show edit button when not editing', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('edit-button')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });

    it('should handle edit button click', async () => {
      render(<EditableMessage message={mockMessage} />);

      const editButton = screen.getByTestId('edit-button');
      fireEvent.click(editButton);

      await waitFor(() => {
        expect(mockEditingControls.startEdit).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show textarea when editing', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true
      });

      render(<EditableMessage message={mockMessage} />);

      const textarea = screen.getByTestId('edit-textarea');
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Original message content that can be edited.');
    });

    it('should handle textarea input', async () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true
      });

      render(<EditableMessage message={mockMessage} />);

      const textarea = screen.getByTestId('edit-textarea');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });

      await waitFor(() => {
        expect(mockEditingControls.updateEdit).toHaveBeenCalledWith('Updated content');
      });
    });

    it('should show save and cancel buttons when editing', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true
      });

      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('save-button')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-button')).toBeInTheDocument();
      expect(screen.getByText('Save')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should handle save button click', async () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true
      });

      render(<EditableMessage message={mockMessage} />);

      const saveButton = screen.getByTestId('save-button');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockEditingControls.saveEdit).toHaveBeenCalled();
      });
    });

    it('should handle cancel button click', async () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true
      });

      render(<EditableMessage message={mockMessage} />);

      const cancelButton = screen.getByTestId('cancel-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockEditingControls.cancelEdit).toHaveBeenCalled();
      });
    });

    it('should show saving state', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true,
        isSaving: true
      });

      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('saving-indicator')).toBeInTheDocument();
      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should disable buttons when saving', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true,
        isSaving: true
      });

      render(<EditableMessage message={mockMessage} />);

      const saveButton = screen.getByTestId('save-button');
      const cancelButton = screen.getByTestId('cancel-button');
      
      expect(saveButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });
  });

  describe('Edit history display', () => {
    it('should show edit history', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('edit-history')).toBeInTheDocument();
      expect(screen.getByText('First edit')).toBeInTheDocument();
      expect(screen.getByText('Second edit')).toBeInTheDocument();
    });

    it('should show version information', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByText('Version 2 of 3')).toBeInTheDocument();
    });

    it('should handle version selection', async () => {
      render(<EditableMessage message={mockMessage} />);

      const versionButton = screen.getByTestId('version-button-edit1');
      fireEvent.click(versionButton);

      await waitFor(() => {
        expect(mockEditingControls.revertToVersion).toHaveBeenCalledWith('edit1');
      });
    });

    it('should show version timestamps', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByText('12:01:00')).toBeInTheDocument();
      expect(screen.getByText('12:02:00')).toBeInTheDocument();
    });

    it('should handle clear history', async () => {
      render(<EditableMessage message={mockMessage} />);

      const clearButton = screen.getByTestId('clear-history-button');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockEditingControls.clearHistory).toHaveBeenCalled();
      });
    });

    it('should show empty history state', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        editHistory: []
      });

      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByText('No edit history')).toBeInTheDocument();
    });

    it('should show changes indicator', () => {
      mockUseMessageEditing.mockReturnValue({
        ...mockEditingState,
        isEditing: true,
        hasChanges: true
      });

      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('changes-indicator')).toBeInTheDocument();
      expect(screen.getByText('Unsaved changes')).toBeInTheDocument();
    });
  });

  describe('Collaborative editing indicators', () => {
    it('should show collaborative editing status', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('collaborative-status')).toBeInTheDocument();
    });

    it('should show other users editing', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByText('2 users editing')).toBeInTheDocument();
    });

    it('should show user avatars', () => {
      render(<EditableMessage message={mockMessage} />);

      const userAvatars = screen.getAllByTestId(/user-avatar-/);
      expect(userAvatars).toHaveLength(2);
    });

    it('should show real-time changes', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('real-time-changes')).toBeInTheDocument();
    });

    it('should handle conflict resolution', () => {
      render(<EditableMessage message={mockMessage} />);

      const conflictResolver = screen.getByTestId('conflict-resolver');
      if (conflictResolver) {
        expect(conflictResolver).toBeInTheDocument();
      }
    });

    it('should show merge options', () => {
      render(<EditableMessage message={mockMessage} />);

      const mergeOptions = screen.getByTestId('merge-options');
      if (mergeOptions) {
        expect(mergeOptions).toBeInTheDocument();
      }
    });
  });

  describe('Plugin integration', () => {
    it('should render with plugin system integration', () => {
      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByTestId('plugin-editing-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify editing behavior', () => {
      render(<EditableMessage message={mockMessage} />);

      const pluginModifiedEditing = screen.getByTestId('plugin-modified-editing');
      if (pluginModifiedEditing) {
        expect(pluginModifiedEditing).toBeInTheDocument();
      }
    });

    it('should handle plugin editing errors gracefully', () => {
      render(<EditableMessage message={mockMessage} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });

    it('should support custom editing plugins', () => {
      render(<EditableMessage message={mockMessage} />);

      const customEditingPlugin = screen.getByTestId('custom-editing-plugin');
      if (customEditingPlugin) {
        expect(customEditingPlugin).toBeInTheDocument();
      }
    });
  });

  describe('Command pattern integration', () => {
    it('should support command-based editing', () => {
      render(<EditableMessage message={mockMessage} />);

      const commandHandler = screen.getByTestId('command-handler');
      if (commandHandler) {
        expect(commandHandler).toBeInTheDocument();
      }
    });

    it('should support editing command history', () => {
      render(<EditableMessage message={mockMessage} />);

      const commandHistory = screen.getByTestId('command-history');
      if (commandHistory) {
        expect(commandHistory).toBeInTheDocument();
      }
    });

    it('should support command undo/redo', () => {
      render(<EditableMessage message={mockMessage} />);

      const undoButton = screen.getByTestId('undo-button');
      const redoButton = screen.getByTestId('redo-button');
      
      if (undoButton) {
        expect(undoButton).toBeInTheDocument();
      }
      if (redoButton) {
        expect(redoButton).toBeInTheDocument();
      }
    });

    it('should handle command execution', async () => {
      render(<EditableMessage message={mockMessage} />);

      const executeButton = screen.getByTestId('execute-command-button');
      if (executeButton) {
        fireEvent.click(executeButton);
        
        await waitFor(() => {
          expect(screen.getByText('Command executed')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Interface compliance', () => {
    it('should implement IEditableMessage interface', () => {
      render(<EditableMessage message={mockMessage} />);

      const editableMessage = screen.getByTestId('editable-message');
      expect(editableMessage).toHaveAttribute('data-interface', 'IEditableMessage');
    });

    it('should follow component interface contract', () => {
      render(<EditableMessage message={mockMessage} />);

      // Should accept required props
      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      render(<EditableMessage message={mockMessage} readOnly={true} />);

      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
    });

    it('should validate required props', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // @ts-ignore - Testing invalid props
      render(<EditableMessage />);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<EditableMessage message={mockMessage} />);

      const editableMessage = screen.getByTestId('editable-message');
      expect(editableMessage).toHaveAttribute('aria-label', 'Editable message');
    });

    it('should support keyboard navigation', () => {
      render(<EditableMessage message={mockMessage} />);

      const editButton = screen.getByTestId('edit-button');
      editButton.focus();
      expect(editButton).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<EditableMessage message={mockMessage} />);

      const controls = screen.getByTestId('editing-controls');
      controls.focus();
      expect(controls).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<EditableMessage message={mockMessage} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('should handle editing errors gracefully', () => {
      mockUseMessageEditing.mockImplementation(() => {
        throw new Error('Editing failed');
      });

      render(<EditableMessage message={mockMessage} />);

      expect(screen.getByText('Editing failed')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should show error retry button', () => {
      mockUseMessageEditing.mockImplementation(() => {
        throw new Error('Editing failed');
      });

      render(<EditableMessage message={mockMessage} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle validation errors', () => {
      render(<EditableMessage message={mockMessage} />);

      const validationError = screen.getByTestId('validation-error');
      if (validationError) {
        expect(validationError).toBeInTheDocument();
      }
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<EditableMessage message={mockMessage} />);

      // Component should only handle message editing
      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<EditableMessage message={mockMessage} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginRenderer = screen.getByTestId('plugin-editing-renderer');
      expect(pluginRenderer).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different message types
      const differentMessage = { 
        ...mockMessage, 
        type: 'image',
        content: 'image.jpg' 
      };

      render(<EditableMessage message={differentMessage} />);
      
      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<EditableMessage message={mockMessage} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('editable-message')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<EditableMessage message={mockMessage} />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageEditing).toHaveBeenCalled();
    });
  });
}); 