-- indexes/chatrooms_indexes.sql

CREATE INDEX IF NOT EXISTS idx_chatrooms_updated_at ON public.chatrooms (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatrooms_user_id ON public.chatrooms (user_id);
