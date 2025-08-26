-- policies/messages_policies.sql

-- Enable RLS (assumes done elsewhere)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow updates to messages only if current user owns the chatroom

-- Insert
CREATE POLICY messages_insert_policy ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT chatrooms.user_id FROM public.chatrooms WHERE chatrooms.id = messages.room_id
    )
  );

-- Select
CREATE POLICY messages_select_policy ON public.messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT chatrooms.user_id FROM public.chatrooms WHERE chatrooms.id = messages.room_id
    )
  );

-- Update (regeneration)
CREATE POLICY messages_update_policy
ON public.messages
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT chatrooms.user_id
    FROM public.chatrooms
    WHERE chatrooms.id = messages.room_id
  )
);
