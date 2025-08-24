-- 1) SQL Security & Columns
-- CREATE/SKIP: applications.score already exists with default 0
-- CREATE/SKIP: profiles.first_name, last_name already exist

-- UPDATE: Add missing RLS policies for enrollments and certificates
-- Enable RLS on enrollments (may already be enabled)
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Create enrollment policies if not exists
CREATE POLICY IF NOT EXISTS enroll_self_select ON public.enrollments
FOR SELECT USING (talent_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.role IN ('ops','recruiter','finance')));

CREATE POLICY IF NOT EXISTS enroll_self_insert ON public.enrollments
FOR INSERT WITH CHECK (talent_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.role IN ('ops','recruiter','finance')));

CREATE POLICY IF NOT EXISTS enroll_staff_update ON public.enrollments
FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.role IN ('ops','recruiter','finance')));

-- Enable RLS on certificates (may already be enabled)
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Create certificate policies if not exists  
CREATE POLICY IF NOT EXISTS cert_self_select ON public.certificates
FOR SELECT USING (talent_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.role IN ('ops','recruiter','finance')));

CREATE POLICY IF NOT EXISTS cert_staff_insert ON public.certificates
FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id=auth.uid() AND p.role IN ('ops','recruiter','finance')));