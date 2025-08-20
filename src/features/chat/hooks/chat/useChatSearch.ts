import { useCallback, useEffect, useState } from 'react';
import mobileStorage from '../../../../shared/lib/mobileStorage';
import { getModelInfo } from '../../constants/models';

export const useChatSearch = (selectedModel: string) => {
  // Search mode state - persist across room changes
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  // Load search mode from storage on mount
  useEffect(() => {
    const loadSearchMode = async () => {
      try {
        const saved = await mobileStorage.getItem('chat_search_mode');
        if (saved === 'true') {
          setIsSearchMode(true);
        }
      } catch {
        // Ignore storage errors
      }
    };
    loadSearchMode();
  }, []);
  
  // Auto-disable search mode when switching to a model that doesn't support search
  useEffect(() => {
    const modelInfo = getModelInfo(selectedModel);
    if (isSearchMode && !modelInfo?.capabilities.search) {
      console.log(`Auto-disabling search mode for model: ${selectedModel}`);
      setIsSearchMode(false);
      // Update storage
      mobileStorage.setItem('chat_search_mode', 'false').catch(() => {
        // Ignore storage errors
      });
    }
  }, [selectedModel, isSearchMode]);
  
  const handleSearchToggle = useCallback(() => {
    // Check if the selected model supports search
    const modelInfo = getModelInfo(selectedModel);
    if (!modelInfo?.capabilities.search) {
      // Search is not supported for this model - could add toast notification here
      console.log(`Search is not supported for model: ${selectedModel}`);
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

  return {
    isSearchMode,
    onSearchToggle: handleSearchToggle,
  };
};
