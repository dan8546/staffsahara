-- Fix the auth.users exposure by removing email from the view
-- and use only data available in the profiles table
DROP VIEW IF EXISTS public.me;

-- Create safe me view without exposing auth.users data
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
  t.slug as tenant_slug
FROM public.profiles p
LEFT JOIN public.tenants t ON p.tenant_id = t.id
WHERE p.user_id = auth.uid();