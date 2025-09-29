-- Ensure profiles table enforces active/suspended lifecycle and auto-activation
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS approved_at timestamptz;

ALTER TABLE public.profiles
  ALTER COLUMN status SET DEFAULT 'active';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.check_constraints
    WHERE constraint_schema = 'public'
      AND constraint_name = 'profiles_status_check'
      AND check_clause ~* '(inactive|invited)'
  ) THEN
    ALTER TABLE public.profiles DROP CONSTRAINT profiles_status_check;
  END IF;
END$$;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_status_check
  CHECK (status IN ('active', 'suspended'));

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS account_type text DEFAULT 'talent';

ALTER TABLE public.profiles
  ALTER COLUMN account_type SET DEFAULT 'talent';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'profiles'
      AND column_name = 'role'
      AND udt_name = 'user_role'
  ) THEN
    ALTER TABLE public.profiles ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE public.profiles ALTER COLUMN role TYPE text USING role::text;
    ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'talent';
  END IF;
END$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_auto(
  p_full_name    text DEFAULT NULL,
  p_default_role text DEFAULT 'talent',
  p_account_type text DEFAULT 'talent'
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_exists boolean;
  v_tenant_id uuid;
BEGIN
  IF uid IS NULL THEN
    RETURN;
  END IF;

  SELECT true INTO v_exists FROM public.profiles WHERE user_id = uid;

  SELECT id
    INTO v_tenant_id
    FROM public.tenants
   WHERE status = 'active'
   ORDER BY created_at
   LIMIT 1;

  IF NOT v_exists THEN
    INSERT INTO public.profiles (
      user_id,
      tenant_id,
      role,
      status,
      approved_at,
      account_type,
      first_name,
      last_name,
      is_staff
    )
    VALUES (
      uid,
      v_tenant_id,
      COALESCE(NULLIF(p_default_role, ''), 'talent'),
      'active',
      now(),
      COALESCE(NULLIF(p_account_type, ''), 'talent'),
      COALESCE(p_full_name, ''),
      '',
      false
    );
  ELSE
    UPDATE public.profiles
       SET role = COALESCE(NULLIF(role, ''), COALESCE(NULLIF(p_default_role, ''), 'talent')),
           status = 'active',
           approved_at = COALESCE(approved_at, now()),
           account_type = COALESCE(NULLIF(account_type, ''), COALESCE(NULLIF(p_account_type, ''), 'talent'))
     WHERE user_id = uid;
  END IF;
END
$$;

REVOKE ALL ON FUNCTION public.ensure_profile_auto(text, text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.ensure_profile_auto(text, text, text) TO anon, authenticated;

UPDATE public.profiles
   SET status = CASE WHEN status = 'suspended' THEN status ELSE 'active' END,
       role = COALESCE(NULLIF(role, ''), 'talent'),
       approved_at = COALESCE(approved_at, now()),
       account_type = COALESCE(NULLIF(account_type, ''), 'talent')
 WHERE status IS DISTINCT FROM 'active'
    OR role IS NULL OR role = ''
    OR approved_at IS NULL
    OR account_type IS NULL OR account_type = '';
