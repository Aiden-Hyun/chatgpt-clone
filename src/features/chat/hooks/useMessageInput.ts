// useMessageInput.ts - Hook for managing chat input and draft messages  
import { useCallback, useEffect, useRef, useState } from 'react';
import mobileStorage from '../../../shared/lib/mobileStorage';

type StorageLike = {
  setItem(key: string, value: string): Promise<void>;
  getItem(key: string): Promise<string | null>;
  removeItem(key: string): Promise<void>;
};

/**
 * Hook for managing chat input and draft messages across different chat rooms
 * 
 * @param numericRoomId - The ID of the current chat room, or null for a new room
 * @param isNewlyCreatedRoom - Whether this is a newly created room (to clear input)
 */
export const useMessageInput = (
  numericRoomId: number | null,
  isNewlyCreatedRoom = false,
  deps?: { storage?: StorageLike }
) => {
  const storage = deps?.storage ?? mobileStorage;
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
          const flag = await storage.getItem(`new_room_created_${numericRoomId}`);
          if (flag === 'true') {
            isNewRoom = true;
            await storage.removeItem(`new_room_created_${numericRoomId}`);
          }
        } catch {
          /* swallow */
        }
      }

      if (isNewRoom) {
        setInput('');
        setDrafts(prev => ({ ...prev, [roomKey]: '' }));
        // Clear persisted draft for this room as well
        storage.removeItem(`chat_draft_${roomKey}`);
      } else {
        // Prefer in-memory draft first
        const currentDraft = draftsRef.current[roomKey] || '';
        if (currentDraft && currentDraft.length > 0) {
          setInput(currentDraft);
        } else {
          // Fallback to persisted draft
          try {
            const saved = await storage.getItem(`chat_draft_${roomKey}`);
            if (saved !== null) {
              setInput(saved);
              setDrafts(prev => ({ ...prev, [roomKey]: saved }));
            } else {
              setInput('');
            }
          } catch {
            setInput('');
          }
        }
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
    // Persist the draft for this room
    storage.setItem(`chat_draft_${roomKey}`, text);
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
    storage.removeItem(`chat_draft_${roomKey}`);
  }, []); // Empty dependency array - stable reference

  /**
   * Update drafts for a specific room
   */
  const updateDrafts = (roomId: number | string, content: string) => {
    const roomKey = typeof roomId === 'number' ? roomId.toString() : roomId;
    setDrafts((prev) => ({ ...prev, [roomKey]: content }));
    storage.setItem(`chat_draft_${roomKey}`, content);
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
