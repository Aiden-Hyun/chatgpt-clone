-- triggers/set_updated_at_messages.sql
-- Trigger to call update_updated_at_column() on messages update

DROP TRIGGER IF EXISTS set_updated_at ON public.messages;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();
