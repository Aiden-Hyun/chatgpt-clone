// src/features/chat/context/ModelContext.tsx
import React, { createContext, useContext } from 'react';

export type ModelContextValue = {
  selectedModel: string;
  updateModel: (model: string) => Promise<void> | void;
};

const ModelContext = createContext<ModelContextValue | null>(null);

export const ModelProvider = (
  { value, children }: { value: ModelContextValue; children: React.ReactNode }
) => {
  return <ModelContext.Provider value={value}>{children}</ModelContext.Provider>;
};

export const useModel = (): ModelContextValue => {
  const ctx = useContext(ModelContext);
  if (!ctx) throw new Error('useModel must be used within a ModelProvider');
  return ctx;
};


