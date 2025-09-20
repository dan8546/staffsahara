-- Créer le profil manquant pour l'utilisateur existant
INSERT INTO public.profiles (
  user_id, 
  first_name, 
  last_name, 
  tenant_id, 
  role, 
  status, 
  approved_at,
  is_staff
)
VALUES (
  '5795c08a-6025-4349-8ea2-18d1bc5af71f'::uuid,
  'Admin',
  'User',
  (SELECT id FROM public.tenants WHERE status = 'active' ORDER BY created_at LIMIT 1),
  'client_admin'::user_role,
  'active',
  now(),
  true
);