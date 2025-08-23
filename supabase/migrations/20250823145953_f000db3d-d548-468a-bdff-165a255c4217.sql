-- Create /rest/v1/me view for easy profile access
CREATE OR REPLACE VIEW public.me AS
SELECT 
  p.id,
  p.user_id,
  p.tenant_id,
  p.role,
  p.first_name,
  p.last_name,
  p.phone,
  p.department,
  p.is_staff,
  p.status,
  p.created_at,
  p.updated_at,
  t.name as tenant_name,
  t.slug as tenant_slug,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as email
FROM public.profiles p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.user_id = auth.uid();

-- Enable RLS on the view
ALTER VIEW public.me SET (security_barrier = true);

-- Create additional tables for comprehensive access control
CREATE TABLE IF NOT EXISTS public.rfqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  description text,
  status text DEFAULT 'draft',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  description text,
  location text,
  start_date date,
  end_date date,
  status text DEFAULT 'active',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mission_docs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  filename text NOT NULL,
  file_path text NOT NULL,
  uploaded_by uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.air_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  request_type text NOT NULL,
  details jsonb,
  status text DEFAULT 'pending',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.openings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id),
  title text NOT NULL,
  description text,
  requirements text[],
  location text,
  salary_range text,
  status text DEFAULT 'open',
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  opening_id uuid NOT NULL REFERENCES public.openings(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL,
  status text DEFAULT 'pending',
  cover_letter text,
  resume_url text,
  applied_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  skills text[],
  experience_years integer,
  certifications jsonb,
  availability text DEFAULT 'available',
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.candidate_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge_type text NOT NULL,
  badge_data jsonb,
  earned_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS on all new tables
ALTER TABLE public.rfqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mission_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.air_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.openings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_badges ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS policies for client data
CREATE POLICY "Client access to own tenant rfqs" ON public.rfqs
FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff access to all rfqs" ON public.rfqs
FOR ALL USING (is_staff_user());

CREATE POLICY "Client access to own tenant missions" ON public.missions
FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff access to all missions" ON public.missions
FOR ALL USING (is_staff_user());

CREATE POLICY "Client access to own tenant mission docs" ON public.mission_docs
FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff access to all mission docs" ON public.mission_docs
FOR ALL USING (is_staff_user());

CREATE POLICY "Client access to own tenant air requests" ON public.air_requests
FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff access to all air requests" ON public.air_requests
FOR ALL USING (is_staff_user());

CREATE POLICY "Client access to own tenant openings" ON public.openings
FOR ALL USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Staff access to all openings" ON public.openings
FOR ALL USING (is_staff_user());

-- Talent-specific policies for applications and profiles
CREATE POLICY "Talent can view all openings" ON public.openings
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own applications" ON public.applications
FOR ALL USING (applicant_id = auth.uid());

CREATE POLICY "Staff can view all applications" ON public.applications
FOR SELECT USING (is_staff_user());

CREATE POLICY "Users can manage their own talent profile" ON public.talent_profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Staff can view all talent profiles" ON public.talent_profiles
FOR SELECT USING (is_staff_user());

CREATE POLICY "Users can manage their own badges" ON public.candidate_badges
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Staff can view all badges" ON public.candidate_badges
FOR SELECT USING (is_staff_user());

-- Add update triggers for timestamps
CREATE TRIGGER update_rfqs_updated_at
  BEFORE UPDATE ON public.rfqs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
  BEFORE UPDATE ON public.missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_air_requests_updated_at
  BEFORE UPDATE ON public.air_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_openings_updated_at
  BEFORE UPDATE ON public.openings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_talent_profiles_updated_at
  BEFORE UPDATE ON public.talent_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();