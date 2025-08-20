export const useChatModel = (
  selectedModel?: string,
  setModel?: (model: string) => void | Promise<void>
) => {
  // Model selection provided by parent via options
  const model = selectedModel ?? 'gpt-3.5-turbo';
  const updateModel = setModel ?? (() => {});

  return {
    selectedModel: model,
    updateModel,
  };
};
