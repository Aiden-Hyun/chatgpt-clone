-- tables/messages.sql

-- Sequence for messages.id
CREATE SEQUENCE IF NOT EXISTS public.messages_id_seq
    START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id bigint NOT NULL DEFAULT nextval('public.messages_id_seq'::regclass),
    room_id bigint NOT NULL,
    user_id uuid NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT messages_role_check CHECK (role IN ('user','assistant','system'))
);

-- Column additions to public.messages

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS client_id UUID;

ALTER TABLE public.messages
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
