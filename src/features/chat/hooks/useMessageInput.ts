// useMessageInput.ts - Hook for managing chat input and draft messages  
import { useCallback, useEffect, useRef, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';

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
    const run = async () => {
      const roomKey = numericRoomId ? numericRoomId.toString() : 'new';
      let isNewRoom = isNewlyCreatedRoom;

      // Detect "newly created" room via storage flag
      if (numericRoomId) {
        try {
          const flag = await mobileStorage.getItem(`new_room_created_${numericRoomId}`);
          if (flag === 'true') {
            isNewRoom = true;
            await mobileStorage.removeItem(`new_room_created_${numericRoomId}`);
            console.log(`[storage] new_room_created flag detected for room ${numericRoomId}`);
          }
        } catch {
          /* swallow */
        }
      }

      if (isNewRoom) {
        setInput('');
        setDrafts(prev => ({ ...prev, [roomKey]: '' }));
        console.log(`Cleared input for room ${roomKey}`);
      } else {
        const currentDraft = draftsRef.current[roomKey] || '';
        setInput(currentDraft);
        console.log(`Restored draft for room ${roomKey}: "${currentDraft}"`);
      }
    };

    run();
  }, [numericRoomId, isNewlyCreatedRoom]); // Removed drafts from dependencies

  /**
   * Handle input changes and save to drafts
   * Memoized to prevent unnecessary re-renders
   * Fixed: Use useRef to avoid re-creating callback when roomId changes
   */
  const roomIdRef = useRef(numericRoomId);
  roomIdRef.current = numericRoomId;
  
  const handleInputChange = useCallback((text: string) => {
    setInput(text);
    const roomKey = roomIdRef.current ? roomIdRef.current.toString() : 'new';
    setDrafts((prev) => ({ ...prev, [roomKey]: text }));
  }, []); // Empty dependency array - stable reference

  /**
   * Clear the current input field
   * Memoized to prevent unnecessary re-renders
   * Fixed: Use roomIdRef to avoid re-creating callback when roomId changes
   */
  const clearInput = useCallback(() => {
    setInput('');
    
    // Also clear the current room's draft when explicitly clearing input
    // This helps with the new chatroom case where the room ID changes
    const roomKey = roomIdRef.current ? roomIdRef.current.toString() : 'new';
    setDrafts(prev => ({ ...prev, [roomKey]: '' }));
  }, []); // Empty dependency array - stable reference

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
