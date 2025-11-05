-- Create bots table
CREATE TABLE IF NOT EXISTS public.logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  log_text text NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  log_level text NOT NULL,
  bot_id uuid NOT NULL
);

alter table "public"."logs" add constraint "logs_bot_id_fkey" FOREIGN KEY (bot_id) REFERENCES bots(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."logs" validate constraint "logs_bot_id_fkey";

alter table "public"."logs" enable row level security;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_logs_updated_at
  BEFORE UPDATE ON public.logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

alter table "public"."bots" alter column "desired_direction" set default '0'::numeric;

