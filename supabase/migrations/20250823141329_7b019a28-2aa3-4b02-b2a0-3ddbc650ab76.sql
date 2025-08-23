-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM (
  'client_admin',
  'approver', 
  'ops',
  'recruiter',
  'finance',
  'talent'
);

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'talent',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, tenant_id)
);

-- Enable RLS
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer functions
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS SETOF public.profiles
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND is_staff = true
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- RLS Policies for tenants
CREATE POLICY "Staff can view all tenants" ON public.tenants
  FOR SELECT TO authenticated
  USING (public.is_staff_user());

CREATE POLICY "Users can view their tenant" ON public.tenants
  FOR SELECT TO authenticated
  USING (id = public.get_user_tenant_id());

CREATE POLICY "Staff can insert tenants" ON public.tenants
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_user());

CREATE POLICY "Staff can update tenants" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.is_staff_user());

-- RLS Policies for profiles
CREATE POLICY "Staff can view all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_staff_user());

CREATE POLICY "Users can view profiles in their tenant" ON public.profiles
  FOR SELECT TO authenticated
  USING (tenant_id = public.get_user_tenant_id());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff can insert profiles" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (public.is_staff_user());

CREATE POLICY "Staff can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_staff_user());

-- Create me view
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
  u.email
FROM public.profiles p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE p.user_id = auth.uid();

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default staff tenant for Staff Sahara
INSERT INTO public.tenants (name, slug, contact_email) 
VALUES ('Staff Sahara', 'staff-sahara', 'admin@staff-sahara.com');