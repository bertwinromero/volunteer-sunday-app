-- Add start_time and end_time to programs table
ALTER TABLE public.programs
ADD COLUMN start_time time,
ADD COLUMN end_time time;

COMMENT ON COLUMN public.programs.start_time IS 'Overall program start time';
COMMENT ON COLUMN public.programs.end_time IS 'Overall program end time';
