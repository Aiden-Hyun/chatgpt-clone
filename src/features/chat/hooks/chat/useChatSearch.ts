import { useCallback, useEffect, useMemo, useState } from 'react';
import mobileStorage from '../../../../shared/lib/mobileStorage';
import { getModelInfo } from '../../constants/models';

export const useChatSearch = (selectedModel: string) => {
  // Search mode state - persist across room changes
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Log only on mount
  useEffect(() => {
    console.log('🔍 [useChatSearch] Hook mounted with model:', selectedModel);
  }, []);
  
  // Load search mode from storage on mount
  useEffect(() => {
    const loadSearchMode = async () => {
      try {
        const saved = await mobileStorage.getItem('chat_search_mode');
        if (saved === 'true') {
          setIsSearchMode(true);
        } else {
          setIsSearchMode(false);
        }
      } catch (error) {
        // Ignore storage errors
      }
    };
    loadSearchMode();
  }, []);
  
  // Auto-disable search mode when switching to a model that doesn't support search
  useEffect(() => {
    const modelInfo = getModelInfo(selectedModel);
    if (isSearchMode && !modelInfo?.capabilities.search) {
      setIsSearchMode(false);
      // Update storage
      mobileStorage.setItem('chat_search_mode', 'false').catch(() => {
        // Ignore storage errors
      });
    }
  }, [selectedModel, isSearchMode]);
  
  // Log when state changes (not every render)
  useEffect(() => {
    console.log('🔍 [useChatSearch] State changed:', { isSearchMode, selectedModel });
  }, [isSearchMode, selectedModel]);
  
  const handleSearchToggle = useCallback(() => {
    // Check if the selected model supports search
    const modelInfo = getModelInfo(selectedModel);
    if (!modelInfo?.capabilities.search) {
      return;
    }
    
    setIsSearchMode(prev => {
      const newValue = !prev;
      // Persist to mobile storage
      mobileStorage.setItem('chat_search_mode', newValue.toString()).catch(() => {
        // Ignore storage errors
      });
      return newValue;
    });
  }, [selectedModel]);

  // Stable return reference
  const result = useMemo(() => ({
    isSearchMode,
    onSearchToggle: handleSearchToggle,
  }), [isSearchMode, handleSearchToggle]);

  return result;
};
