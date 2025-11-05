-- Add indexes to optimize logs queries
-- This index optimizes queries filtering by bot_id, optionally by log_level, and ordering by created_at DESC

CREATE INDEX IF NOT EXISTS idx_logs_bot_id_created_at ON public.logs(bot_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_bot_id_log_level_created_at ON public.logs(bot_id, log_level, created_at DESC);

