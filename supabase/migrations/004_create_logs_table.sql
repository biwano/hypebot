-- Create bots table
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_text text NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_logs_updated_at
  BEFORE UPDATE ON public.logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

drop policy "Allow all operations on bots" on "public"."bots";

alter table "public"."bots" alter column "desired_direction" set default '0'::numeric;

alter table "public"."logs" enable row level security;