-- Idempotent tenant and profile setup
-- First, check current state and create/update accordingly

-- Create or get the demo tenant (adjusting for actual schema)
INSERT INTO public.tenants (name, slug, status, contact_email)
VALUES ('Client Demo', 'client-demo', 'active', 'demo@client.com')
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  status = EXCLUDED.status,
  contact_email = EXCLUDED.contact_email;

-- Get the tenant ID for use in profile upsert
-- Note: This will be used in application code, not directly in migration

-- Example upsert for profile (schema-compliant)
-- This creates a template - actual UID and tenant_id should be provided by application
-- INSERT INTO public.profiles (user_id, tenant_id, first_name, last_name, role, is_staff, status)
-- VALUES (
--   '<USER_ID_TO_REPLACE>', 
--   (SELECT id FROM public.tenants WHERE name = 'Client Demo' LIMIT 1),
--   'Admin Client', 
--   'Demo', 
--   'client_admin'::user_role, 
--   false, 
--   'active'
-- )
-- ON CONFLICT (user_id) DO UPDATE SET
--   tenant_id = EXCLUDED.tenant_id,
--   role = EXCLUDED.role,
--   first_name = EXCLUDED.first_name,
--   last_name = EXCLUDED.last_name,
--   is_staff = EXCLUDED.is_staff,
--   status = EXCLUDED.status;