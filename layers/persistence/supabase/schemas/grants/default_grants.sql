-- grants/default_grants.sql

-- Schema usage
REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;

-- Chatrooms table
GRANT ALL ON TABLE public.chatrooms TO anon;
GRANT ALL ON TABLE public.chatrooms TO authenticated;
GRANT ALL ON SEQUENCE public.chatrooms_id_seq TO anon;
GRANT ALL ON SEQUENCE public.chatrooms_id_seq TO authenticated;

-- Messages table
GRANT ALL ON TABLE public.messages TO anon;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON SEQUENCE public.messages_id_seq TO anon;
GRANT ALL ON SEQUENCE public.messages_id_seq TO authenticated;

-- Default privileges for future tables
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
