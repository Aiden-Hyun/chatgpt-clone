-- policies/chatrooms_policies.sql

-- Enable RLS (assumes done elsewhere)
ALTER TABLE public.chatrooms ENABLE ROW LEVEL SECURITY;

-- Delete
CREATE POLICY chatrooms_delete_policy ON public.chatrooms
  FOR DELETE USING (auth.uid() = user_id);

-- Insert
CREATE POLICY chatrooms_insert_policy ON public.chatrooms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Select
CREATE POLICY chatrooms_select_policy ON public.chatrooms
  FOR SELECT USING (auth.uid() = user_id);

-- Update
CREATE POLICY chatrooms_update_policy ON public.chatrooms
  FOR UPDATE USING (auth.uid() = user_id);
