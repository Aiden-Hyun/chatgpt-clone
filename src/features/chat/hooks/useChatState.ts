import { useCallback, useState } from 'react';
import { ChatMessage } from '../types';

interface LoadingStates {
  newMessage?: boolean;
  regenerating?: Set<number>;
}

interface ChatState {
  messages: ChatMessage[];
  loadingStates: LoadingStates;
  loading: boolean;
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
  const isNewMessageLoading = loadingStates.newMessage;
  const regeneratingIndices = loadingStates.regenerating || new Set();

  // State setters
  const setMessages = useCallback((newMessages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => {
    setState(prev => ({
      ...prev,
      messages: typeof newMessages === 'function' ? newMessages(prev.messages) : newMessages,
    }));
  }, []);

  const setLoadingStates = useCallback((newLoadingStates: Partial<LoadingStates> | ((prev: LoadingStates) => LoadingStates)) => {
    setState(prev => ({
      ...prev,
      loadingStates: typeof newLoadingStates === 'function' ? newLoadingStates(prev.loadingStates) : { ...prev.loadingStates, ...newLoadingStates },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  // Loading state actions
  const startNewMessageLoading = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, newMessage: true }));
  }, [setLoadingStates]);

  const stopNewMessageLoading = useCallback(() => {
    setLoadingStates(prev => ({ ...prev, newMessage: false }));
  }, [setLoadingStates]);

  const startRegenerating = useCallback((index: number) => {
    setLoadingStates(prev => ({
      ...prev,
      regenerating: new Set([...(prev.regenerating || []), index]),
    }));
  }, [setLoadingStates]);

  const stopRegenerating = useCallback((index: number) => {
    setLoadingStates(prev => {
      const newRegenerating = new Set(prev.regenerating || []);
      newRegenerating.delete(index);
      return { ...prev, regenerating: newRegenerating };
    });
  }, [setLoadingStates]);

  const isRegenerating = useCallback((index: number) => {
    return regeneratingIndices.has(index);
  }, [regeneratingIndices]);

  return {
    // State
    messages,
    loading,
    isNewMessageLoading,
    regeneratingIndices,
    isRegenerating,
    
    // State setters
    setMessages,
    setLoadingStates,
    setLoading,
    
    // Loading actions
    startNewMessageLoading,
    stopNewMessageLoading,
    startRegenerating,
    stopRegenerating,
  };
}; 