-- Add notification toggle to program items
ALTER TABLE public.program_items
ADD COLUMN notify_enabled BOOLEAN NOT NULL DEFAULT true;

-- Add comment for the new field
COMMENT ON COLUMN public.program_items.notify_enabled IS 'Whether to send notification before this program item starts';
