-- tables/chatrooms.sql

-- Sequence for chatrooms.id
CREATE SEQUENCE IF NOT EXISTS public.chatrooms_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Chatrooms table
CREATE TABLE IF NOT EXISTS public.chatrooms (
    id bigint NOT NULL DEFAULT nextval('public.chatrooms_id_seq'::regclass),
    user_id uuid NOT NULL,
    name text NOT NULL DEFAULT 'New Chat',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    model text NOT NULL DEFAULT 'gpt-3.5-turbo'
);
