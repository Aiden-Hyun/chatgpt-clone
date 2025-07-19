// src/services/chat/sendMessage.ts
import { router } from 'expo-router';
import { supabase } from '../../supabase';
import { ChatMessage } from '../../types';
import { createChatRoom } from './createChatRoom';
import { fetchOpenAIResponse } from './fetchOpenAIResponse';

type SendMessageArgs = {
  userContent: string;
  numericRoomId: number | null;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  setIsTyping: React.Dispatch<React.SetStateAction<boolean>>;
  setDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  model: string;
  regenerateIndex?: number; // Optional index for regenerating a specific message
};

export const sendMessageHandler = async ({
  userContent,
  numericRoomId,
  messages,
  setMessages,
  setIsTyping,
  setDrafts,
  model,
  regenerateIndex,
}: SendMessageArgs) => {
  const userMsg: ChatMessage = { role: 'user', content: userContent };
  const assistantMsg: ChatMessage = { role: 'assistant', content: '' };

  // If regenerating, don't add new messages, just update the existing one
  if (regenerateIndex !== undefined) {
    setMessages((prev) => {
      const updated = [...prev];
      // Update the assistant message at the regeneration index
      updated[regenerateIndex] = { ...updated[regenerateIndex], content: '' };
      return updated;
    });
  } else {
    // Normal flow: add new user and assistant messages
    setMessages((prev) => [...prev, userMsg, assistantMsg]);
  }
  setIsTyping(true);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    router.replace('/login');
    return;
  }

  let roomId = numericRoomId;
  let isNewRoom = false;
  
  if (!roomId) {
    isNewRoom = true;
    // Pass the selected model when creating a new chatroom
    roomId = await createChatRoom(session.user.id, model);
    if (!roomId) return;
    // We'll handle navigation after saving the message
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
    const data = await fetchOpenAIResponse(payload, session.access_token);
    // ✅ Debug log: OpenAI response
    console.log("OpenAI response data:", data);

    const fullContent = data.choices?.[0]?.message?.content;
    if (!fullContent || typeof fullContent !== 'string') {
      console.error("⚠️ No valid response from OpenAI:", data);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '⚠️ No response received from OpenAI.' },
      ]);
      setIsTyping(false);
      return;
    }

    let tempContent = '';
    const typeInterval = setInterval(() => {
      if (tempContent.length < fullContent.length) {
        tempContent += fullContent.charAt(tempContent.length);
        setMessages((prev) => {
          const updated = [...prev];
          // If regenerating, update the message at the specified index
          // Otherwise, update the last message
          const targetIndex = regenerateIndex !== undefined ? regenerateIndex : updated.length - 1;
          updated[targetIndex] = { role: 'assistant', content: tempContent };
          return updated;
        });
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);

        // If regenerating, we only need to update the assistant message in the database
        // Otherwise, insert both user and assistant messages
        if (regenerateIndex !== undefined) {
          supabase.from('messages')
            .update({ content: fullContent })
            .eq('room_id', roomId)
            .eq('role', 'assistant')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1);
        } else {
          (async () => {
            try {
              const { error: insertErr } = await supabase.from('messages').insert([
                { room_id: roomId, user_id: session.user.id, role: 'user', content: userMsg.content },
                { room_id: roomId, user_id: session.user.id, role: 'assistant', content: fullContent },
              ]);
              if (insertErr) {
                console.error('Failed to insert user & assistant messages:', insertErr);
              }
            } catch (e) {
              console.error('Unexpected error inserting messages:', e);
            }
          })();
        }
      }
    }, 20);



    await supabase
      .from('chatrooms')
      .update({ name: userMsg.content.slice(0, 100), updated_at: new Date().toISOString() })
      .eq('id', roomId);

    // Clear both the 'new' draft and set an empty draft for the new room ID
    if (isNewRoom) {
      setDrafts((prev) => {
        const updatedDrafts = { ...prev };
        // Clear the 'new' draft that was used before room creation
        updatedDrafts['new'] = '';
        // Set empty draft for the new room
        updatedDrafts[roomId.toString()] = '';
        return updatedDrafts;
      });
    } else {
      // For existing rooms, just clear the current room's draft
      const roomKey = roomId.toString();
      setDrafts((prev) => ({ ...prev, [roomKey]: '' }));
    }
    
    // Navigate to the new room after everything is saved
    if (isNewRoom) {
      // Store the messages and selected model in sessionStorage before navigation
      try {
        // Store messages
        const messagesForStorage = [
          userMsg,
          { role: 'assistant', content: fullContent }
        ];
        sessionStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messagesForStorage));
        
        // Store the selected model to ensure it persists
        sessionStorage.setItem(`chat_model_${roomId}`, model);
        
        console.log(`Stored model in sessionStorage: ${model} for room ${roomId}`);
      } catch (e) {
        console.log('Could not store data in sessionStorage');
      }
      
      // Now navigate to the new room
      router.replace(`/chat?roomId=${roomId}`);
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
