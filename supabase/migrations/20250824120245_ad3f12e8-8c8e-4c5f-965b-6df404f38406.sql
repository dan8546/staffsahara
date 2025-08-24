-- SECURITY FIX: Suppression de la vue 'me' dangereuse et correction des fonctions SECURITY DEFINER

-- 1. Supprimer la vue 'me' qui pose un risque de sécurité
DROP VIEW IF EXISTS public.me;

-- 2. Recréer la fonction get_me SANS SECURITY DEFINER 
-- Elle utilisera les permissions de l'utilisateur connecté (plus sécurisé)
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
-- SECURITY INVOKER (par défaut) - utilise les permissions de l'utilisateur
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

-- 3. Les autres fonctions SECURITY DEFINER sont nécessaires pour les policies RLS
-- On les garde car elles sont utilisées dans les policies et sont sécurisées
-- get_current_user_profile, is_staff_user, get_user_tenant_id restent SECURITY DEFINER
-- car elles sont nécessaires pour les policies RLS et sont correctement implémentées

-- Commentaire: La vue 'me' était dangereuse car elle bypasse RLS.
-- La fonction get_me() utilise maintenant SECURITY INVOKER (plus sûr)
-- et respecte les policies RLS existantes sur les tables profiles et tenants.