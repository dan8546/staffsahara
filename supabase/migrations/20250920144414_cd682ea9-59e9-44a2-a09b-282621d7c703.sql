-- Strengthen RLS policies for leads table to address security concerns
-- Drop existing policies and recreate with more explicit security

DROP POLICY IF EXISTS "leads_insert_public" ON public.leads;
DROP POLICY IF EXISTS "leads_select_staff" ON public.leads;

-- Create more explicit policies with better security checks
CREATE POLICY "leads_public_insert_only" 
ON public.leads 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "leads_staff_select_only" 
ON public.leads 
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND p.is_staff = true 
    AND p.role IN ('ops', 'recruiter', 'finance')
    AND p.status = 'active'
  )
);

-- Explicitly deny UPDATE and DELETE operations (already blocked but make it explicit)
CREATE POLICY "leads_no_updates" 
ON public.leads 
FOR UPDATE 
TO public
USING (false);

CREATE POLICY "leads_no_deletes" 
ON public.leads 
FOR DELETE 
TO public
USING (false);

-- Add a comment for clarity
COMMENT ON TABLE public.leads IS 'Customer leads - INSERT public, SELECT staff only, no UPDATE/DELETE allowed';