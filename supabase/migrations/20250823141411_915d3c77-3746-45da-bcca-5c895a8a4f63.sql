-- Fix security issues: Update functions with proper search_path
CREATE OR REPLACE FUNCTION public.get_current_user_profile()
RETURNS SETOF public.profiles
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
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
SET search_path = public
AS $$
  SELECT tenant_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Drop and recreate the me view without security definer to fix auth exposure
DROP VIEW IF EXISTS public.me;

-- Create a function instead of a view to avoid exposing auth.users
CREATE OR REPLACE FUNCTION public.get_me()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  tenant_id UUID,
  role public.user_role,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  is_staff BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  tenant_name TEXT,
  tenant_slug TEXT,
  email TEXT
)
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
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
$$;