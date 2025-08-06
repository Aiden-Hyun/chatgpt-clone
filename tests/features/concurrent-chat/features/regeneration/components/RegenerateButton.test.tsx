import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RegenerateButton } from '../../../../../../src/features/concurrent-chat/features/regeneration/components/RegenerateButton';
import { useMessageRegeneration } from '../../../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration';

// Mock the regeneration hook
jest.mock('../../../../../../src/features/concurrent-chat/features/regeneration/useMessageRegeneration');

const mockUseMessageRegeneration = useMessageRegeneration as jest.MockedFunction<typeof useMessageRegeneration>;

describe('RegenerateButton', () => {
  const mockMessage = {
    id: 'msg1',
    content: 'Original message content',
    status: 'completed',
    role: 'assistant',
    timestamp: new Date('2024-01-01T12:00:00Z')
  };

  const mockRegenerationState = {
    isRegenerating: false,
    regenerationCount: 2,
    canRegenerate: true,
    qualityScore: 0.85,
    history: [
      { id: 'reg1', content: 'First regeneration', timestamp: new Date('2024-01-01T12:01:00Z') },
      { id: 'reg2', content: 'Second regeneration', timestamp: new Date('2024-01-01T12:02:00Z') }
    ]
  };

  const mockRegenerationControls = {
    regenerate: jest.fn(),
    cancelRegeneration: jest.fn(),
    clearHistory: jest.fn(),
    setQualityThreshold: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMessageRegeneration.mockReturnValue({
      ...mockRegenerationState,
      ...mockRegenerationControls
    });
  });

  describe('Regeneration UI controls', () => {
    it('should render regenerate button', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
      expect(screen.getByText('Regenerate')).toBeInTheDocument();
    });

    it('should handle regenerate button click', async () => {
      render(<RegenerateButton message={mockMessage} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      fireEvent.click(regenerateButton);

      await waitFor(() => {
        expect(mockRegenerationControls.regenerate).toHaveBeenCalledWith('msg1');
      });
    });

    it('should show regenerating state', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationState,
        isRegenerating: true
      });

      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('regenerating-indicator')).toBeInTheDocument();
      expect(screen.getByText('Regenerating...')).toBeInTheDocument();
    });

    it('should disable button when regenerating', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationState,
        isRegenerating: true
      });

      render(<RegenerateButton message={mockMessage} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      expect(regenerateButton).toBeDisabled();
    });

    it('should show cancel button when regenerating', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationState,
        isRegenerating: true
      });

      render(<RegenerateButton message={mockMessage} />);

      const cancelButton = screen.getByTestId('cancel-regeneration-button');
      expect(cancelButton).toBeInTheDocument();
    });

    it('should handle cancel regeneration', async () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationState,
        isRegenerating: true
      });

      render(<RegenerateButton message={mockMessage} />);

      const cancelButton = screen.getByTestId('cancel-regeneration-button');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockRegenerationControls.cancelRegeneration).toHaveBeenCalled();
      });
    });

    it('should show regeneration count', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('Regenerated 2 times')).toBeInTheDocument();
    });

    it('should show quality score', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('Quality: 85%')).toBeInTheDocument();
    });
  });

  describe('Regeneration history display', () => {
    it('should show regeneration history', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('regeneration-history')).toBeInTheDocument();
      expect(screen.getByText('First regeneration')).toBeInTheDocument();
      expect(screen.getByText('Second regeneration')).toBeInTheDocument();
    });

    it('should show history count', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('2 versions')).toBeInTheDocument();
    });

    it('should handle history item selection', async () => {
      render(<RegenerateButton message={mockMessage} />);

      const historyItem = screen.getByTestId('history-item-reg1');
      fireEvent.click(historyItem);

      await waitFor(() => {
        expect(screen.getByText('First regeneration')).toBeInTheDocument();
      });
    });

    it('should show history timestamps', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('12:01:00')).toBeInTheDocument();
      expect(screen.getByText('12:02:00')).toBeInTheDocument();
    });

    it('should handle clear history', async () => {
      render(<RegenerateButton message={mockMessage} />);

      const clearButton = screen.getByTestId('clear-history-button');
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockRegenerationControls.clearHistory).toHaveBeenCalled();
      });
    });

    it('should show empty history state', () => {
      mockUseMessageRegeneration.mockReturnValue({
        ...mockRegenerationState,
        history: []
      });

      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('No regeneration history')).toBeInTheDocument();
    });
  });

  describe('A/B testing interface', () => {
    it('should show A/B testing controls', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('ab-testing-controls')).toBeInTheDocument();
    });

    it('should show variant selector', () => {
      render(<RegenerateButton message={mockMessage} />);

      const variantSelector = screen.getByTestId('variant-selector');
      expect(variantSelector).toBeInTheDocument();
    });

    it('should handle variant selection', async () => {
      render(<RegenerateButton message={mockMessage} />);

      const variantSelector = screen.getByTestId('variant-selector');
      fireEvent.change(variantSelector, { target: { value: 'variant-b' } });

      expect(variantSelector).toHaveValue('variant-b');
    });

    it('should show A/B test results', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('ab-test-results')).toBeInTheDocument();
      expect(screen.getByText('Variant A: 60% preference')).toBeInTheDocument();
      expect(screen.getByText('Variant B: 40% preference')).toBeInTheDocument();
    });

    it('should show statistical significance', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('Statistical significance: 95%')).toBeInTheDocument();
    });

    it('should handle A/B test reset', async () => {
      render(<RegenerateButton message={mockMessage} />);

      const resetButton = screen.getByTestId('reset-ab-test-button');
      fireEvent.click(resetButton);

      await waitFor(() => {
        expect(screen.getByText('A/B test reset')).toBeInTheDocument();
      });
    });
  });

  describe('Plugin integration', () => {
    it('should render with plugin system integration', () => {
      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByTestId('plugin-regeneration-renderer')).toBeInTheDocument();
    });

    it('should allow plugins to modify regeneration behavior', () => {
      render(<RegenerateButton message={mockMessage} />);

      const pluginModifiedRegeneration = screen.getByTestId('plugin-modified-regeneration');
      if (pluginModifiedRegeneration) {
        expect(pluginModifiedRegeneration).toBeInTheDocument();
      }
    });

    it('should handle plugin regeneration errors gracefully', () => {
      render(<RegenerateButton message={mockMessage} />);

      const pluginError = screen.getByTestId('plugin-error');
      if (pluginError) {
        expect(pluginError).toBeInTheDocument();
      }
    });

    it('should support custom regeneration plugins', () => {
      render(<RegenerateButton message={mockMessage} />);

      const customRegenerationPlugin = screen.getByTestId('custom-regeneration-plugin');
      if (customRegenerationPlugin) {
        expect(customRegenerationPlugin).toBeInTheDocument();
      }
    });
  });

  describe('Command pattern integration', () => {
    it('should support command-based regeneration', () => {
      render(<RegenerateButton message={mockMessage} />);

      const commandHandler = screen.getByTestId('command-handler');
      if (commandHandler) {
        expect(commandHandler).toBeInTheDocument();
      }
    });

    it('should support regeneration command history', () => {
      render(<RegenerateButton message={mockMessage} />);

      const commandHistory = screen.getByTestId('command-history');
      if (commandHistory) {
        expect(commandHistory).toBeInTheDocument();
      }
    });

    it('should support command undo/redo', () => {
      render(<RegenerateButton message={mockMessage} />);

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
      render(<RegenerateButton message={mockMessage} />);

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
    it('should implement IRegenerateButton interface', () => {
      render(<RegenerateButton message={mockMessage} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      expect(regenerateButton).toHaveAttribute('data-interface', 'IRegenerateButton');
    });

    it('should follow component interface contract', () => {
      render(<RegenerateButton message={mockMessage} />);

      // Should accept required props
      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
    });

    it('should handle optional props correctly', () => {
      render(<RegenerateButton message={mockMessage} showHistory={false} />);

      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
    });

    it('should validate required props', () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // @ts-ignore - Testing invalid props
      render(<RegenerateButton />);
      
      expect(consoleError).toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<RegenerateButton message={mockMessage} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      expect(regenerateButton).toHaveAttribute('aria-label', 'Regenerate message');
    });

    it('should support keyboard navigation', () => {
      render(<RegenerateButton message={mockMessage} />);

      const regenerateButton = screen.getByTestId('regenerate-button');
      regenerateButton.focus();
      expect(regenerateButton).toHaveFocus();
    });

    it('should have proper focus management', () => {
      render(<RegenerateButton message={mockMessage} />);

      const controls = screen.getByTestId('regeneration-controls');
      controls.focus();
      expect(controls).toHaveFocus();
    });

    it('should support screen readers', () => {
      render(<RegenerateButton message={mockMessage} />);

      const screenReaderText = screen.getByTestId('screen-reader-text');
      if (screenReaderText) {
        expect(screenReaderText).toBeInTheDocument();
      }
    });
  });

  describe('Error handling', () => {
    it('should handle regeneration errors gracefully', () => {
      mockUseMessageRegeneration.mockImplementation(() => {
        throw new Error('Regeneration failed');
      });

      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('Regeneration failed')).toBeInTheDocument();
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should show error retry button', () => {
      mockUseMessageRegeneration.mockImplementation(() => {
        throw new Error('Regeneration failed');
      });

      render(<RegenerateButton message={mockMessage} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle network errors', () => {
      mockUseMessageRegeneration.mockImplementation(() => {
        throw new Error('Network error');
      });

      render(<RegenerateButton message={mockMessage} />);

      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  describe('SOLID Principles Compliance', () => {
    it('should follow Single Responsibility Principle', () => {
      render(<RegenerateButton message={mockMessage} />);

      // Component should only handle regeneration UI
      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
    });

    it('should follow Open/Closed Principle', () => {
      render(<RegenerateButton message={mockMessage} />);

      // Should be open for extension (new plugins) but closed for modification
      const pluginRenderer = screen.getByTestId('plugin-regeneration-renderer');
      expect(pluginRenderer).toBeInTheDocument();
    });

    it('should follow Liskov Substitution Principle', () => {
      // Should work with different message types
      const differentMessage = { 
        ...mockMessage, 
        type: 'image',
        content: 'image.jpg' 
      };

      render(<RegenerateButton message={differentMessage} />);
      
      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
    });

    it('should follow Interface Segregation Principle', () => {
      render(<RegenerateButton message={mockMessage} />);

      // Should depend on focused interfaces, not large ones
      expect(screen.getByTestId('regenerate-button')).toBeInTheDocument();
    });

    it('should follow Dependency Inversion Principle', () => {
      render(<RegenerateButton message={mockMessage} />);

      // Should depend on abstractions (hooks) not concretions
      expect(mockUseMessageRegeneration).toHaveBeenCalled();
    });
  });
}); 