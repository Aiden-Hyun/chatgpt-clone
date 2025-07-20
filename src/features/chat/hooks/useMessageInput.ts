// useMessageInput.ts - Hook for managing chat input and draft messages
import { useEffect, useRef, useState } from 'react';

/**
 * Hook for managing chat input and draft messages across different chat rooms
 * 
 * @param numericRoomId - The ID of the current chat room, or null for a new room
 * @param isNewlyCreatedRoom - Whether this is a newly created room (to clear input)
 */
export const useMessageInput = (numericRoomId: number | null, isNewlyCreatedRoom = false) => {
  // Current input text in the text field
  const [input, setInput] = useState('');
  
  // Draft messages for each room, keyed by room ID
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  // Use a ref to track current drafts to avoid dependency cycle
  const draftsRef = useRef<Record<string, string>>(drafts);
  
  // Keep the ref updated when drafts change
  useEffect(() => {
    draftsRef.current = drafts;
  }, [drafts]);
  
  // Update input when room changes
  useEffect(() => {
    const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
    
    // Check if this is a newly created room from sessionStorage
    let isNewRoom = isNewlyCreatedRoom;
    
    if (numericRoomId) {
      try {
        const newRoomFlag = sessionStorage.getItem(`new_room_created_${numericRoomId}`);
        if (newRoomFlag === 'true') {
          // Found a new room flag, clear it and set isNewRoom to true
          isNewRoom = true;
          sessionStorage.removeItem(`new_room_created_${numericRoomId}`);
          console.log(`Detected newly created room ${numericRoomId} from sessionStorage flag`);
        }
      } catch (e) {
        // Ignore sessionStorage errors
      }
    }
    
    // For newly created rooms, always start with empty input
    if (isNewRoom) {
      setInput('');
      // Also clear the draft for this room to ensure it's empty
      setDrafts(prev => ({ ...prev, [roomKey]: '' }));
      console.log(`Cleared input for new room ${roomKey}`);
    } else {
      // Otherwise, restore draft from saved drafts
      const currentDraft = draftsRef.current[roomKey] || '';
      setInput(currentDraft);
      console.log(`Restored draft for room ${roomKey}: "${currentDraft}"`); 
    }
  }, [numericRoomId, isNewlyCreatedRoom]); // Removed drafts from dependencies

  /**
   * Handle input changes and save to drafts
   */
  const handleInputChange = (text: string) => {
    setInput(text);
    const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
    setDrafts((prev) => ({ ...prev, [roomKey]: text }));
  };

  /**
   * Clear the current input field
   */
  const clearInput = () => {
    setInput('');
    
    // Also clear the current room's draft when explicitly clearing input
    // This helps with the new chatroom case where the room ID changes
    const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
    setDrafts(prev => ({ ...prev, [roomKey]: '' }));
  };

  /**
   * Update drafts for a specific room
   */
  const updateDrafts = (roomId: number | string, content: string) => {
    const roomKey = typeof roomId === 'number' ? roomId.toString() : roomId;
    setDrafts((prev) => ({ ...prev, [roomKey]: content }));
  };

  return {
    // State
    input,
    drafts,
    
    // State setters
    setInput,
    setDrafts,
    
    // Actions
    handleInputChange,
    clearInput,
    updateDrafts
  };
};
