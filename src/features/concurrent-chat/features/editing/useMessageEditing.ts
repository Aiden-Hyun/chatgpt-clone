import { useCallback, useEffect, useState } from 'react';
import { ServiceContainer } from '../../core/container/ServiceContainer';
import { EventBus } from '../../core/events/EventBus';
import { ConcurrentMessage } from '../../core/types/interfaces/IMessageProcessor';
import { EditingService } from './EditingService';

/**
 * Hook for managing message editing
 * Provides editing functionality for messages using the EditingService
 */
export function useMessageEditing(eventBus: EventBus, serviceContainer: ServiceContainer) {
  // Editing service
  const [editingService] = useState(() => new EditingService(eventBus, serviceContainer));
  
  // State
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeEditingSessions, setActiveEditingSessions] = useState<Set<string>>(new Set());
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<number>(5000);

  // Initialize editing service
  useEffect(() => {
    const initializeEditingService = async () => {
      try {
        setError(null);
        setIsLoading(true);
        
        await editingService.init();
        setIsInitialized(true);
        
        // Update state with initial values
        setAutoSaveEnabled(editingService.isAutoSaveEnabled());
        setAutoSaveInterval(editingService.getAutoSaveInterval());
        
      } catch (err) {
        setError(`Failed to initialize editing service: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    initializeEditingService();

    // Cleanup
    return () => {
      editingService.destroy();
    };
  }, [editingService]);

  // Update active editing sessions periodically
  useEffect(() => {
    if (!isInitialized) return;

    const updateActiveEditingSessions = () => {
      const activeIds = new Set(editingService.getActiveEditingSessions());
      setActiveEditingSessions(activeIds);
    };

    const interval = setInterval(updateActiveEditingSessions, 1000);
    return () => clearInterval(interval);
  }, [isInitialized, editingService]);

  /**
   * Start editing a message
   */
  const startEditing = useCallback((messageId: string, originalMessage: ConcurrentMessage): void => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      editingService.startEditing(messageId, originalMessage);
    } catch (err) {
      const errorMessage = `Failed to start editing: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, editingService]);

  /**
   * Update the edited content for a message
   */
  const updateEditedContent = useCallback((messageId: string, newContent: string): void => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      editingService.updateEditedContent(messageId, newContent);
    } catch (err) {
      const errorMessage = `Failed to update edited content: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, editingService]);

  /**
   * Save the edited message
   */
  const saveEditedMessage = useCallback(async (messageId: string): Promise<ConcurrentMessage> => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      const editedMessage = await editingService.saveEditedMessage(messageId);
      return editedMessage;
    } catch (err) {
      const errorMessage = `Failed to save edited message: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, editingService]);

  /**
   * Cancel editing for a message
   */
  const cancelEditing = useCallback((messageId: string): void => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      editingService.cancelEditing(messageId);
    } catch (err) {
      const errorMessage = `Failed to cancel editing: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, editingService]);

  /**
   * Check if a message is currently being edited
   */
  const isEditing = useCallback((messageId: string): boolean => {
    return editingService.isEditing(messageId);
  }, [editingService]);

  /**
   * Get the current editing session for a message
   */
  const getEditingSession = useCallback((messageId: string) => {
    return editingService.getEditingSession(messageId);
  }, [editingService]);

  /**
   * Get editing service statistics
   */
  const getEditingStats = useCallback(() => {
    return editingService.getEditingStats();
  }, [editingService]);

  /**
   * Enable or disable auto-save
   */
  const updateAutoSaveEnabled = useCallback((enabled: boolean): void => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    editingService.setAutoSaveEnabled(enabled);
    setAutoSaveEnabled(enabled);
  }, [isInitialized, editingService]);

  /**
   * Check if auto-save is enabled
   */
  const isAutoSaveEnabled = useCallback((): boolean => {
    return editingService.isAutoSaveEnabled();
  }, [editingService]);

  /**
   * Set the auto-save interval in milliseconds
   */
  const updateAutoSaveInterval = useCallback((interval: number): void => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    editingService.setAutoSaveInterval(interval);
    setAutoSaveInterval(interval);
  }, [isInitialized, editingService]);

  /**
   * Get the auto-save interval in milliseconds
   */
  const getAutoSaveInterval = useCallback((): number => {
    return editingService.getAutoSaveInterval();
  }, [editingService]);

  /**
   * Save all active editing sessions
   */
  const saveAllEditingSessions = useCallback(async (): Promise<ConcurrentMessage[]> => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      const savedMessages = await editingService.saveAllEditingSessions();
      return savedMessages;
    } catch (err) {
      const errorMessage = `Failed to save all editing sessions: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [isInitialized, editingService]);

  /**
   * Get the number of active editing sessions
   */
  const getActiveEditingCount = useCallback((): number => {
    return editingService.getActiveEditingCount();
  }, [editingService]);

  return {
    // State
    isInitialized,
    isLoading,
    error,
    activeEditingSessions: Array.from(activeEditingSessions),
    autoSaveEnabled,
    autoSaveInterval,
    
    // Actions
    startEditing,
    updateEditedContent,
    saveEditedMessage,
    cancelEditing,
    setAutoSaveEnabled,
    setAutoSaveInterval,
    saveAllEditingSessions,
    
    // Queries
    isEditing,
    getEditingSession,
    getEditingStats,
    isAutoSaveEnabled,
    getAutoSaveInterval,
    getActiveEditingCount,
    
    // Service reference
    editingService,
  };
} 