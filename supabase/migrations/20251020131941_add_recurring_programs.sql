-- Add recurring program fields to programs table
ALTER TABLE public.programs
ADD COLUMN is_recurring boolean DEFAULT false NOT NULL,
ADD COLUMN recurrence_pattern text CHECK (recurrence_pattern IN ('weekly', 'biweekly', 'monthly')),
ADD COLUMN recurrence_end_date date,
ADD COLUMN recurrence_day_of_week integer CHECK (recurrence_day_of_week >= 0 AND recurrence_day_of_week <= 6),
ADD COLUMN parent_program_id uuid REFERENCES public.programs(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.programs.is_recurring IS 'Whether this is a recurring program template';
COMMENT ON COLUMN public.programs.recurrence_pattern IS 'How often the program repeats: weekly, biweekly, or monthly';
COMMENT ON COLUMN public.programs.recurrence_end_date IS 'Date when recurring program stops generating instances';
COMMENT ON COLUMN public.programs.recurrence_day_of_week IS 'Day of week for recurrence (0=Sunday, 6=Saturday)';
COMMENT ON COLUMN public.programs.parent_program_id IS 'Links program instances to their recurring template';

-- Create index for parent program lookups
CREATE INDEX IF NOT EXISTS programs_parent_program_id_idx ON public.programs(parent_program_id);
