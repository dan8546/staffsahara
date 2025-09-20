-- Corriger la fonction get_me pour éviter l'erreur de permission sur auth.users
CREATE OR REPLACE FUNCTION public.get_me()
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  tenant_id uuid, 
  role user_role, 
  first_name text, 
  last_name text, 
  phone text, 
  department text, 
  is_staff boolean, 
  status text, 
  created_at timestamp with time zone, 
  updated_at timestamp with time zone, 
  tenant_name text, 
  tenant_slug text, 
  email text
)
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $function$
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
    auth.email() as email
  FROM public.profiles p
  LEFT JOIN public.tenants t ON p.tenant_id = t.id
  WHERE p.user_id = auth.uid();
$function$