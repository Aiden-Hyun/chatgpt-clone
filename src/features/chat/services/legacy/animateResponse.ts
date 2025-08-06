// src/features/chat/services/legacy/animateResponse.ts
// Original implementation - moved to legacy folder
import { ChatMessage } from '../types';

type AnimateResponseArgs = {
  fullContent: string;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  regenerateIndex?: number;
  messageId?: string; // ✅ Phase 2: Add message ID support
  onComplete: () => void;
};

// ✅ Phase 3: Global animation tracker to handle concurrent messages
const animationTracker = new Map<string, number>();

/**
 * Animates the typing of a response with a typewriter effect
 */
export const animateResponse = ({
  fullContent,
  setMessages,
  setIsTyping,
  regenerateIndex,
  messageId, // ✅ Phase 2: Add message ID support
  onComplete,
}: AnimateResponseArgs): void => {
  let tempContent = '';
  
  // ✅ Phase 3: Add debug logging for concurrent message tracking
  console.log(`3️⃣ [ANIMATION] Starting animation for messageId: ${messageId}, regenerateIndex: ${regenerateIndex}`);
  
  const typeInterval = setInterval(() => {
    if (tempContent.length < fullContent.length) {
      tempContent += fullContent.charAt(tempContent.length);
      setMessages((prev) => {
        const updated = [...prev];
        
        // ✅ Phase 3: Fix concurrent message animation issue
        let targetIndex: number;
        
        // ✅ Phase 3: Add detailed logging of all messages for debugging
        console.log(`3️⃣ [ANIMATION] Looking for messageId: ${messageId}`);
        console.log(`3️⃣ [ANIMATION] All messages in array:`, updated.map((msg, idx) => ({
          index: idx,
          role: msg.role,
          contentLength: msg.content?.length || 0,
          loadingId: (msg as any)._loadingId,
          hasLoadingId: !!(msg as any)._loadingId
        })));
        
        if (regenerateIndex !== undefined) {
          // For regeneration, use the specified index
          targetIndex = regenerateIndex;
          console.log(`3️⃣ [ANIMATION] Using regeneration index: ${targetIndex}`);
        } else if (messageId) {
          // ✅ Phase 3: Use global animation tracker for concurrent messages
          if (animationTracker.has(messageId)) {
            // We already know which index this messageId should animate
            targetIndex = animationTracker.get(messageId)!;
            console.log(`3️⃣ [ANIMATION] Using tracked index for messageId ${messageId}: ${targetIndex}`);
          } else {
            // First time animating this messageId, find the target and track it
            let foundIndex = -1;
            
            // Look backwards through the messages to find the most recent empty assistant message
            for (let i = updated.length - 1; i >= 0; i--) {
              const msg = updated[i];
              if (msg.role === 'assistant' && !msg.content) {
                foundIndex = i;
                console.log(`3️⃣ [ANIMATION] Found empty assistant message at index ${i} for messageId ${messageId}`);
                break;
              }
            }
            
            targetIndex = foundIndex;
            
            // Track this messageId -> index mapping
            if (targetIndex !== -1) {
              animationTracker.set(messageId, targetIndex);
              console.log(`3️⃣ [ANIMATION] Tracked messageId ${messageId} -> index ${targetIndex}`);
            }
            
            console.log(`3️⃣ [ANIMATION] Using empty assistant message at index: ${targetIndex}`);
            
            // If not found, fall back to the last assistant message
            if (targetIndex === -1) {
              // ✅ Phase 3: Add more detailed debugging when message not found
              console.log(`3️⃣ [ANIMATION] No empty assistant message found! Available messages:`, updated.map((msg, idx) => ({
                index: idx,
                role: msg.role,
                contentLength: msg.content?.length || 0,
                loadingId: (msg as any)._loadingId
              })));
              
              targetIndex = updated.findLastIndex(msg => msg.role === 'assistant');
              console.log(`3️⃣ [ANIMATION] Fallback to last assistant message at index: ${targetIndex}`);
            }
          }
        } else {
          // Fallback: update the last message
          targetIndex = updated.length - 1;
          console.log(`3️⃣ [ANIMATION] Using last message index: ${targetIndex}`);
        }
        
        // Ensure we have a valid index
        if (targetIndex >= 0 && targetIndex < updated.length) {
          updated[targetIndex] = { role: 'assistant', content: tempContent };
          console.log(`3️⃣ [ANIMATION] Updated message at index ${targetIndex} with content length: ${tempContent.length}`);
        } else {
          console.log(`3️⃣ [ANIMATION] Invalid target index: ${targetIndex}, array length: ${updated.length}`);
        }
        
        return updated;
      });
    } else {
      clearInterval(typeInterval);
      setIsTyping(false);
      
      // ✅ Phase 3: Clean up animation tracker when animation completes
      if (messageId) {
        animationTracker.delete(messageId);
        console.log(`3️⃣ [ANIMATION] Cleaned up tracker for messageId: ${messageId}`);
      }
      
      onComplete();
    }
  }, 20);
}; 