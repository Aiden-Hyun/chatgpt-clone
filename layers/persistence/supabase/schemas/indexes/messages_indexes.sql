-- indexes/messages_indexes.sql

CREATE INDEX IF NOT EXISTS idx_messages_room_id ON public.messages (room_id);
