-- Fix security issues: Remove SECURITY DEFINER from the me view
-- and create proper RLS policy instead
DROP VIEW IF EXISTS public.me;

-- Create the me view without SECURITY DEFINER
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

-- Apply proper access control via RLS policy on the underlying tables
-- The view will respect the existing RLS policies on profiles and tenants tables