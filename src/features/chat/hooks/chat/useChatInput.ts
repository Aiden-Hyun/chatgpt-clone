import { useMessageInput } from '../message/useMessageInput';

export const useChatInput = (numericRoomId: number | null) => {
  // Input management
  const {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  } = useMessageInput(
    numericRoomId,
    false
  );

  return {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput
  };
};
