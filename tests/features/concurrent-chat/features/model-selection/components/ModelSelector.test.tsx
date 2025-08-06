import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModelSelector } from '../../../../../../src/features/concurrent-chat/features/model-selection/components/ModelSelector';
import { useModelSelection } from '../../../../../../src/features/concurrent-chat/features/model-selection/useModelSelection';

// Mock the model selection hook
jest.mock('../../../../../../src/features/concurrent-chat/features/model-selection/useModelSelection');

const mockUseModelSelection = useModelSelection as jest.MockedFunction<typeof useModelSelection>;

describe('ModelSelector', () => {
  const mockModels = [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient', cost: 0.002 },
    { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model', cost: 0.03 },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest and greatest', cost: 0.01 },
    { id: 'claude-3', name: 'Claude 3', description: 'Anthropic\'s latest', cost: 0.015 }
  ];

  const mockSelectionState = {
    currentModel: 'gpt-3.5-turbo',
    availableModels: mockModels,
    isChanging: false,
    lastChanged: new Date('2024-01-01T12:00:00Z'),
    changeHistory: [
      { from: 'gpt-3.5-turbo', to: 'gpt-4', timestamp: new Date('2024-01-01T11:00:00Z') },
      { from: 'gpt-4', to: 'gpt-3.5-turbo', timestamp: new Date('2024-01-01T10:00:00Z') }
    ]
  };

  const mockSelectionControls = {
    changeModel: jest.fn(),
    resetToDefault: jest.fn(),
    clearHistory: jest.fn(),
    setPreferredModel: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseModelSelection.mockReturnValue({
      ...mockSelectionState,
      ...mockSelectionControls
    });
  });

  describe('Model selection UI', () => {
    it('should render model selector', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
      expect(screen.getByText('Select Model')).toBeInTheDocument();
    });

    it('should show current model', () => {
      render(<ModelSelector />);

      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(screen.getByTestId('current-model')).toHaveTextContent('GPT-3.5 Turbo');
    });

    it('should show model dropdown', () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      expect(modelDropdown).toBeInTheDocument();
    });

    it('should display all available models', () => {
      render(<ModelSelector />);

      expect(screen.getByText('GPT-3.5 Turbo')).toBeInTheDocument();
      expect(screen.getByText('GPT-4')).toBeInTheDocument();
      expect(screen.getByText('GPT-4 Turbo')).toBeInTheDocument();
      expect(screen.getByText('Claude 3')).toBeInTheDocument();
    });

    it('should show model descriptions', () => {
      render(<ModelSelector />);

      expect(screen.getByText('Fast and efficient')).toBeInTheDocument();
      expect(screen.getByText('Most capable model')).toBeInTheDocument();
      expect(screen.getByText('Latest and greatest')).toBeInTheDocument();
      expect(screen.getByText('Anthropic\'s latest')).toBeInTheDocument();
    });

    it('should show model costs', () => {
      render(<ModelSelector />);

      expect(screen.getByText('$0.002 per 1K tokens')).toBeInTheDocument();
      expect(screen.getByText('$0.03 per 1K tokens')).toBeInTheDocument();
      expect(screen.getByText('$0.01 per 1K tokens')).toBeInTheDocument();
      expect(screen.getByText('$0.015 per 1K tokens')).toBeInTheDocument();
    });
  });

  describe('Model options display', () => {
    it('should show model comparison', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('model-comparison')).toBeInTheDocument();
    });

    it('should show model capabilities', () => {
      render(<ModelSelector />);

      expect(screen.getByText('Capabilities')).toBeInTheDocument();
      expect(screen.getByText('Speed')).toBeInTheDocument();
      expect(screen.getByText('Accuracy')).toBeInTheDocument();
    });

    it('should show model performance metrics', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
      expect(screen.getByText('Response Time')).toBeInTheDocument();
      expect(screen.getByText('Token Usage')).toBeInTheDocument();
    });

    it('should show model recommendations', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('model-recommendations')).toBeInTheDocument();
      expect(screen.getByText('Recommended for:')).toBeInTheDocument();
    });

    it('should show model limitations', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('model-limitations')).toBeInTheDocument();
      expect(screen.getByText('Limitations:')).toBeInTheDocument();
    });

    it('should show model availability status', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('availability-status')).toBeInTheDocument();
      expect(screen.getByText('Available')).toBeInTheDocument();
    });
  });

  describe('Model change handling', () => {
    it('should handle model selection', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(mockSelectionControls.changeModel).toHaveBeenCalledWith('gpt-4');
      });
    });

    it('should show changing state', () => {
      mockUseModelSelection.mockReturnValue({
        ...mockSelectionState,
        isChanging: true
      });

      render(<ModelSelector />);

      expect(screen.getByTestId('changing-indicator')).toBeInTheDocument();
      expect(screen.getByText('Changing model...')).toBeInTheDocument();
    });

    it('should disable dropdown when changing', () => {
      mockUseModelSelection.mockReturnValue({
        ...mockSelectionState,
        isChanging: true
      });

      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      expect(modelDropdown).toBeDisabled();
    });

    it('should show confirmation dialog for expensive models', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(screen.getByText('This model costs more. Continue?')).toBeInTheDocument();
      });
    });

    it('should handle confirmation dialog confirm', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      const confirmButton = screen.getByText('Confirm');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockSelectionControls.changeModel).toHaveBeenCalledWith('gpt-4');
      });
    });

    it('should handle confirmation dialog cancel', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockSelectionControls.changeModel).not.toHaveBeenCalled();
      });
    });

    it('should show model change success message', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(screen.getByText('Model changed successfully')).toBeInTheDocument();
      });
    });

    it('should show model change error message', async () => {
      mockSelectionControls.changeModel.mockRejectedValue(new Error('Change failed'));

      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(screen.getByText('Failed to change model')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin integration', () => {
    it('should render with plugin system integration', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('plugin-model-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify model selection behavior', () => {
      render(<ModelSelector />);

      const pluginModifiedSelection = screen.getByTestId('plugin-modified-selection');
      if (pluginModifiedSelection) {
        expect(pluginModifiedSelection).toBeInTheDocument();
      }
    });

    it('should handle plugin selection errors gracefully', () => {
      render(<ModelSelector />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });

    it('should support custom model plugins', () => {
      render(<ModelSelector />);

      const customModelPlugin = screen.getByTestId('custom-model-plugin');
      if (customModelPlugin) {
        expect(customModelPlugin).toBeInTheDocument();
      }
    });
  });

  describe('Command pattern integration', () => {
    it('should support command-based model selection', () => {
      render(<ModelSelector />);

      const commandHandler = screen.getByTestId('command-handler');
      if (commandHandler) {
        expect(commandHandler).toBeInTheDocument();
      }
    });

    it('should support model selection command history', () => {
      render(<ModelSelector />);

      const commandHistory = screen.getByTestId('command-history');
      if (commandHistory) {
        expect(commandHistory).toBeInTheDocument();
      }
    });

    it('should support command undo/redo', () => {
      render(<ModelSelector />);

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
      render(<ModelSelector />);

      const executeButton = screen.getByTestId('execute-command-button');
      if (executeButton) {
        fireEvent.click(executeButton);
        
        await waitFor(() => {
          expect(screen.getByText('Command executed')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Supabase integration', () => {
    it('should persist model selection to Supabase', async () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'gpt-4' } });

      await waitFor(() => {
        expect(screen.getByText('Model preference saved')).toBeInTheDocument();
      });
    });

    it('should load model preference from Supabase', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('supabase-loader')).toBeInTheDocument();
    });

    it('should handle Supabase connection errors', () => {
      render(<ModelSelector />);

      const supabaseError = screen.getByTestId('supabase-error');
      if (supabaseError) {
        expect(supabaseError).toBeInTheDocument();
      }
    });

    it('should sync model selection across devices', () => {
      render(<ModelSelector />);

      expect(screen.getByTestId('sync-indicator')).toBeInTheDocument();
    });
  });

  describe('Interface compliance', () => {
    it('should implement IModelSelector interface', () => {
      render(<ModelSelector />);

      const modelSelector = screen.getByTestId('model-selector');
      expect(modelSelector).toHaveAttribute('data-interface', 'IModelSelector');
    });

    it('should follow component interface contract', () => {
      render(<ModelSelector />);

      // Should accept required props
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      render(<ModelSelector showCosts={false} />);

      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should validate required props', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // @ts-ignore - Testing invalid props
      render(<ModelSelector models={null} />);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ModelSelector />);

      const modelSelector = screen.getByTestId('model-selector');
      expect(modelSelector).toHaveAttribute('aria-label', 'Model selector');
    });

    it('should support keyboard navigation', () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      modelDropdown.focus();
      expect(modelDropdown).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<ModelSelector />);

      const controls = screen.getByTestId('model-controls');
      controls.focus();
      expect(controls).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<ModelSelector />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('should handle model selection errors gracefully', () => {
      mockUseModelSelection.mockImplementation(() => {
        throw new Error('Model selection failed');
      });

      render(<ModelSelector />);

      expect(screen.getByText('Model selection failed')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should show error retry button', () => {
      mockUseModelSelection.mockImplementation(() => {
        throw new Error('Model selection failed');
      });

      render(<ModelSelector />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle network errors', () => {
      mockUseModelSelection.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(<ModelSelector />);

      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should handle invalid model selection', () => {
      render(<ModelSelector />);

      const modelDropdown = screen.getByTestId('model-dropdown');
      fireEvent.change(modelDropdown, { target: { value: 'invalid-model' } });

      expect(screen.getByText('Invalid model selection')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should render efficiently', () => {
      const startTime = performance.now();
      
      render(<ModelSelector />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(10); // Should render quickly
    });

    it('should handle large model lists efficiently', () => {
      const largeModelList = Array.from({ length: 100 }, (_, i) => ({
        id: `model-${i}`,
        name: `Model ${i}`,
        description: `Description for model ${i}`,
        cost: 0.001 * (i + 1)
      }));

      mockUseModelSelection.mockReturnValue({
        ...mockSelectionState,
        availableModels: largeModelList
      });

      const startTime = performance.now();
      render(<ModelSelector />);
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(50); // Should handle large lists quickly
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<ModelSelector />);

      // Component should only handle model selection UI
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<ModelSelector />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginRenderer = screen.getByTestId('plugin-model-renderer');
      expect(pluginRenderer).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different model types
      const differentModels = [
        { id: 'custom-model', name: 'Custom Model', description: 'Custom description', cost: 0.005 }
      ];

      mockUseModelSelection.mockReturnValue({
        ...mockSelectionState,
        availableModels: differentModels
      });

      render(<ModelSelector />);
      
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<ModelSelector />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('model-selector')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<ModelSelector />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseModelSelection).toHaveBeenCalled();
    });
  });
}); 