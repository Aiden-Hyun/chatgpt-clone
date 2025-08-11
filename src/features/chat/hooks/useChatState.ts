import { useCallback, useState } from 'react';
import { ChatMessage } from '../types';

// Legacy interfaces - will be phased out in favor of state machine
interface LoadingStates {
  regenerating?: Set<number>;  // Only keep regeneration tracking by index
}

interface ChatState {
  messages: ChatMessage[];
  loadingStates: LoadingStates;
  loading: boolean; // Only for initial room loading
}

export const useChatState = (roomId: number | null) => {

  const [state, setState] = useState<ChatState>({
    messages: [],
    loadingStates: {
      regenerating: new Set(),
    },
    loading: true,
  });

  // State getters
  const { messages, loadingStates, loading } = state;
  const regeneratingIndices = loadingStates.regenerating || new Set();
  
  // ✅ NEW: State machine-based getters
  const getLoadingMessages = useCallback(() => {
    return messages.filter(msg => msg.state === 'loading');
  }, [messages]);
  
  const getAnimatingMessages = useCallback(() => {
    return messages.filter(msg => msg.state === 'animating');
  }, [messages]);
  
  const isNewMessageLoading = useCallback(() => {
    // Check if the last message is an assistant message in loading state
    const lastMessage = messages[messages.length - 1];
    return lastMessage?.role === 'assistant' && lastMessage?.state === 'loading';
  }, [messages]);

  // OPTIMIZED: Single state setter to prevent multiple re-renders
  const updateState = useCallback((updates: Partial<{
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[]);
    loadingStates: Partial<LoadingStates> | ((prev: LoadingStates) => LoadingStates);
    loading: boolean;
  }>) => {
    setState(prev => {
      const newState = { ...prev };
      
      if (updates.messages !== undefined) {
        newState.messages = typeof updates.messages === 'function' 
          ? updates.messages(prev.messages) 
          : updates.messages;
      }
      
      if (updates.loadingStates !== undefined) {
        newState.loadingStates = typeof updates.loadingStates === 'function'
          ? updates.loadingStates(prev.loadingStates)
          : { ...prev.loadingStates, ...updates.loadingStates };
      }
      
      if (updates.loading !== undefined) {
        newState.loading = updates.loading;
      }
      
      return newState;
    });
  }, []);

  // Legacy setters for backward compatibility (will be removed in Phase 2)
  const setMessages = useCallback((newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    updateState({ messages: newMessages });
  }, [updateState]);

  const setLoadingStates = useCallback((newLoadingStates: Partial<LoadingStates> | ((prev: LoadingStates) => LoadingStates)) => {
    updateState({ loadingStates: newLoadingStates });
  }, [updateState]);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading });
  }, [updateState]);

  // ✅ STATE MACHINE: All message-specific logic moved to MessageStateManager

  const startRegenerating = useCallback((index: number) => {
    updateState({
      loadingStates: prev => ({
        ...prev,
        regenerating: new Set([...Array.from(prev.regenerating || new Set<number>()), index]),
      })
    });
  }, [updateState]);

  const stopRegenerating = useCallback((index: number) => {
    updateState({
      loadingStates: prev => {
        const newRegenerating = new Set(prev.regenerating || []);
        newRegenerating.delete(index);
        return { ...prev, regenerating: newRegenerating };
      }
    });
  }, [updateState]);

  const isRegenerating = useCallback((index: number) => {
    return regeneratingIndices.has(index);
  }, [regeneratingIndices]);

  return {
    // ✅ STATE MACHINE: Core state
    messages,
    loading, // Only for initial room loading
    regeneratingIndices, // Keep regeneration by index for UI compatibility
    
    // ✅ STATE MACHINE: New state-based getters  
    getLoadingMessages,
    getAnimatingMessages,
    isNewMessageLoading: isNewMessageLoading(), // Convert to direct value
    
    // ✅ STATE MACHINE: Core setters
    setMessages,
    setLoadingStates,
    setLoading,
    
    // ✅ STATE MACHINE: Regeneration actions (keep for UI compatibility)
    startRegenerating,
    stopRegenerating,
    isRegenerating,
  };
}; 