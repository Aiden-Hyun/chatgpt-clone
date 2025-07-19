

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;




ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";





SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."chatrooms" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" DEFAULT 'New Chat'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "model" "text" DEFAULT 'gpt-3.5-turbo'::"text" NOT NULL
);


ALTER TABLE "public"."chatrooms" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."chatrooms_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."chatrooms_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."chatrooms_id_seq" OWNED BY "public"."chatrooms"."id";



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" bigint NOT NULL,
    "room_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."messages_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."messages_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."messages_id_seq" OWNED BY "public"."messages"."id";



ALTER TABLE ONLY "public"."chatrooms" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."chatrooms_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."messages" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."messages_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."chatrooms"
    ADD CONSTRAINT "chatrooms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."chatrooms"
    ADD CONSTRAINT "unique_user_chatroom_name" UNIQUE ("user_id", "name");



CREATE INDEX "idx_chatrooms_updated_at" ON "public"."chatrooms" USING "btree" ("updated_at" DESC);



CREATE INDEX "idx_chatrooms_user_id" ON "public"."chatrooms" USING "btree" ("user_id");



CREATE INDEX "idx_messages_room_id" ON "public"."messages" USING "btree" ("room_id");



ALTER TABLE ONLY "public"."chatrooms"
    ADD CONSTRAINT "chatrooms_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."chatrooms"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE "public"."chatrooms" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "chatrooms_delete_policy" ON "public"."chatrooms" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "chatrooms_insert_policy" ON "public"."chatrooms" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "chatrooms_select_policy" ON "public"."chatrooms" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "chatrooms_update_policy" ON "public"."chatrooms" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "messages_insert_policy" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() IN ( SELECT "chatrooms"."user_id"
   FROM "public"."chatrooms"
  WHERE ("chatrooms"."id" = "messages"."room_id"))));



CREATE POLICY "messages_select_policy" ON "public"."messages" FOR SELECT USING (("auth"."uid"() IN ( SELECT "chatrooms"."user_id"
   FROM "public"."chatrooms"
  WHERE ("chatrooms"."id" = "messages"."room_id"))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT ALL ON SCHEMA "public" TO "anon";
GRANT ALL ON SCHEMA "public" TO "authenticated";








































































































































































GRANT ALL ON TABLE "public"."chatrooms" TO "anon";
GRANT ALL ON TABLE "public"."chatrooms" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."chatrooms_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."chatrooms_id_seq" TO "authenticated";



GRANT ALL ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";



GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."messages_id_seq" TO "authenticated";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";



























RESET ALL;
