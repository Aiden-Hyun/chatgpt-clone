-- constraints/chatrooms_constraints.sql

-- Primary key
ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT chatrooms_pkey PRIMARY KEY (id);

-- Unique constraint to avoid duplicate names per user
ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT unique_user_chatroom_name UNIQUE (user_id, name);

-- Foreign key to auth.users
ALTER TABLE ONLY public.chatrooms
    ADD CONSTRAINT chatrooms_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users(id) ON DELETE CASCADE;
