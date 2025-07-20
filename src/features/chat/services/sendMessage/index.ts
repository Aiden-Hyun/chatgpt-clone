// src/features/chat/services/sendMessage/index.ts
import { supabase } from '../../../../shared/lib/supabase';
import { getSession } from '../../../../shared/lib/supabase/getSession';
import { ChatMessage } from '../../types';
import { animateResponse } from '../animateResponse';
import { createChatRoom } from '../createChatRoom';
import { fetchOpenAIResponse } from '../fetchOpenAIResponse';
import { insertMessages } from '../insertMessages';
import { updateAssistantMessage } from '../updateAssistantMessage';
import { handleDraftCleanup } from './handleDraftCleanup';
import { handleMessageState } from './handleMessageState';
import { handleNewRoomRedirect } from './handleNewRoomRedirect';
import { handlePostAnimation } from './handlePostAnimation';

export type SendMessageArgs = {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  model: string;
  regenerateIndex?: number; // Optional index for regenerating a specific message
};

/**
 * Main controller for sending or regenerating messages
 */
export const sendMessageHandler = async (args: SendMessageArgs): Promise<void> => {
  const { userContent, numericRoomId, messages, setMessages, setIsTyping, setDrafts, model, regenerateIndex } = args;

  const userMsg: ChatMessage = { role: 'user', content: userContent };
  const assistantMsg: ChatMessage = { role: 'assistant', content: '' };

  // Update local message state
  handleMessageState({ regenerateIndex, setMessages, userMsg, assistantMsg });
  setIsTyping(true);

  // Get session using the extracted utility
  const session = await getSession();
  if (!session) return; // getSession handles the redirect

  // Handle room creation if needed
  let roomId = numericRoomId;
  let isNewRoom = false;
  
  if (!roomId) {
    isNewRoom = true;
    // Pass the selected model when creating a new chatroom
    roomId = await createChatRoom(session.user.id, model);
    if (!roomId) return;
  }

  // For regeneration, use messages up to the user message that triggered the original response
  // For normal flow, include all messages plus the new user message
  const currentMessages = regenerateIndex !== undefined 
    ? messages 
    : [...messages, userMsg];
  
  const payload = {
    roomId,
    messages: currentMessages,
    model,
  };

  try {
    // Get response from OpenAI
    const data = await fetchOpenAIResponse(payload, session.access_token);
    const fullContent = data.choices?.[0]?.message?.content;
    
    if (!fullContent || typeof fullContent !== 'string') {
      console.error("No valid response from OpenAI:", data);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ No response received from OpenAI.' },
      ]);
      setIsTyping(false);
      return;
    }

    // Animate the response and handle database operations after completion
    animateResponse({
      fullContent,
      setMessages,
      setIsTyping,
      regenerateIndex,
      onComplete: async () => {
        await handlePostAnimation({ 
          regenerateIndex, 
          roomId, 
          fullContent, 
          session, 
          userMsg, 
          insertMessages, 
          updateAssistantMessage 
        });
      }
    });

    // Update the chatroom name and timestamp
    await supabase
      .from('chatrooms')
      .update({ 
        name: userMsg.content.slice(0, 100), 
        updated_at: new Date().toISOString() 
      })
      .eq('id', roomId);

    // Clean up drafts
    handleDraftCleanup({ isNewRoom, roomId, setDrafts });
    
    // Handle navigation for new rooms
    if (isNewRoom) {
      handleNewRoomRedirect({ roomId, userMsg, fullContent, model });
    }
  } catch (err) {
    console.error("❌ Error contacting GPT:", err);
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '⚠️ Error contacting GPT.' },
    ]);
    setIsTyping(false);
  }
};
