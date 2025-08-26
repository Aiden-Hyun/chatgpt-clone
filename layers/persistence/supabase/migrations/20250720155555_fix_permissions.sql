-- Fix permissions for authenticated users

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant access to tables
GRANT ALL ON TABLE public.chatrooms TO authenticated;
GRANT ALL ON TABLE public.messages TO authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated;

-- Grant access to sequences (needed for IDENTITY columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Fix the profiles update trigger that was incomplete in the previous migration
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
