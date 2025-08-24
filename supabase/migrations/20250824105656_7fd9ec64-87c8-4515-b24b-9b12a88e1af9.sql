-- Create unique constraint on tenants.name first, then do idempotent operations
ALTER TABLE public.tenants ADD CONSTRAINT tenants_name_unique UNIQUE (name);

-- Now do the idempotent tenant creation
INSERT INTO public.tenants (name, slug, status, contact_email)
VALUES ('Client Demo', 'client-demo', 'active', 'demo@client.com')
ON CONFLICT (name) DO UPDATE SET
  slug = EXCLUDED.slug,
  status = EXCLUDED.status,
  contact_email = EXCLUDED.contact_email;