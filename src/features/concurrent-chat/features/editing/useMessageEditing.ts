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
  const saveEditedMessage = useCallback(async (messageId: string, content: string): Promise<ConcurrentMessage> => {
    if (!isInitialized) {
      throw new Error('Editing service not initialized');
    }

    try {
      setError(null);
      // First update the content, then save
      editingService.updateEditedContent(messageId, content);
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

  /**
   * Check if a message can be edited
   */
  const canEdit = useCallback((messageId: string): boolean => {
    if (!isInitialized) return false;
    
    // Check if message is not currently being edited
    if (isEditing(messageId)) return false;
    
    // Check if message exists and has content
    const session = getEditingSession(messageId);
    if (!session) return true; // Can start editing if no session exists
    
    return true;
  }, [isInitialized, isEditing, getEditingSession]);

  /**
   * Validate an edit
   */
  const validateEdit = useCallback((messageId: string, content: string): { isValid: boolean; error?: string } => {
    if (!content || content.trim().length === 0) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (content.length > 2000) {
      return { isValid: false, error: 'Message too long (max 2000 characters)' };
    }
    
    return { isValid: true, error: '' };
  }, []);

  /**
   * Get edit history for a message
   */
  const getEditHistory = useCallback((messageId: string): any[] => {
    if (!isInitialized) return [];
    
    // This would typically come from the service
    // For now, return empty array
    return [];
  }, [isInitialized]);

  /**
   * Clear edit history for a message
   */
  const clearEditHistory = useCallback((messageId: string): void => {
    if (!isInitialized) return;
    
    // This would typically clear history in the service
    // For now, do nothing
  }, [isInitialized]);

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
    canEdit,
    validateEdit,
    getEditHistory,
    clearEditHistory,
    getEditingSession,
    getEditingStats,
    isAutoSaveEnabled,
    getAutoSaveInterval,
    getActiveEditingCount,
    
    // Service reference
    editingService,
  };
} 