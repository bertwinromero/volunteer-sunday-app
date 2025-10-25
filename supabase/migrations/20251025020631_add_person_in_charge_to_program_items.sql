-- Add person_in_charge field to program_items table
-- This allows admins to assign someone responsible for each program item

ALTER TABLE public.program_items
ADD COLUMN person_in_charge TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.program_items.person_in_charge IS 'Name of the person responsible for this program item';
