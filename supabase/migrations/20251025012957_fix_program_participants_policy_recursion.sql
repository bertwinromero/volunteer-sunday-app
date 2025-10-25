-- Fix: Remove recursive policy that causes infinite recursion
-- The old policy queried program_participants within a program_participants policy check

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Users can view participants of programs they joined" ON public.program_participants;

-- Create new non-recursive policies for viewing participants

-- Allow viewing participants of public programs (no recursion)
CREATE POLICY "Anyone can view participants of public programs"
  ON public.program_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = program_participants.program_id
      AND p.public_access_enabled = true
    )
  );

-- Allow authenticated users to view their own participant records
CREATE POLICY "Users can view their own participant records"
  ON public.program_participants FOR SELECT
  USING (user_id = auth.uid());
