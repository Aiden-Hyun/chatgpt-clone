// src/features/chat/services/sendMessage/handleDraftCleanup.ts

/**
 * Handles cleaning up draft messages after sending
 */
export const handleDraftCleanup = ({
  isNewRoom,
  roomId,
  setDrafts,
}: {
  isNewRoom: boolean;
  roomId: number;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}): void => {
  if (isNewRoom) {
    setDrafts((prev) => {
      const updatedDrafts = { ...prev };
      // Clear the 'new' draft that was used before room creation
      updatedDrafts['new'] = '';
      // Set empty draft for the new room
      updatedDrafts[roomId.toString()] = '';
      console.log(`Setting empty draft for new room ${roomId}`);
      return updatedDrafts;
    });
  } else {
    // For existing rooms, just clear the current room's draft
    const roomKey = roomId.toString();
    setDrafts((prev) => ({ ...prev, [roomKey]: '' }));
    console.log(`Cleared draft for existing room ${roomKey}`);
  }
};
