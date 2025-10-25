-- Add template support fields to programs table (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'programs'
                 AND column_name = 'is_template') THEN
    ALTER TABLE public.programs ADD COLUMN is_template BOOLEAN NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public'
                 AND table_name = 'programs'
                 AND column_name = 'template_id') THEN
    ALTER TABLE public.programs ADD COLUMN template_id UUID REFERENCES public.programs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add comments for new fields
COMMENT ON COLUMN public.programs.is_template IS 'Whether this program is a template that can be copied';
COMMENT ON COLUMN public.programs.template_id IS 'ID of the template this program was created from';

-- Drop recurring program fields (no longer needed with template approach)
ALTER TABLE public.programs
DROP COLUMN IF EXISTS is_recurring,
DROP COLUMN IF EXISTS recurrence_pattern,
DROP COLUMN IF EXISTS recurrence_end_date,
DROP COLUMN IF EXISTS recurrence_day_of_week,
DROP COLUMN IF EXISTS parent_program_id;

-- Make date nullable for templates (templates don't need a specific date)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_schema = 'public'
             AND table_name = 'programs'
             AND column_name = 'date'
             AND is_nullable = 'NO') THEN
    ALTER TABLE public.programs ALTER COLUMN date DROP NOT NULL;
  END IF;
END $$;

-- Update comment for date field
COMMENT ON COLUMN public.programs.date IS 'Program date (nullable for templates)';
