import { useMessageInput } from "@/entities/message";

export const useChatInput = (numericRoomId: number | null) => {
  // Input management
  const { input, drafts, setDrafts, handleInputChange, clearInput } =
    useMessageInput(numericRoomId, false);

  return {
    input,
    drafts,
    setDrafts,
    handleInputChange,
    clearInput,
  };
};
