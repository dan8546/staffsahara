-- Fix search_path security warning for ensure_profile_auto function
CREATE OR REPLACE FUNCTION public.ensure_profile_auto(
  p_full_name text default null,
  p_default_role text default 'talent',
  p_account_type text default 'talent'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  v_exists boolean;
  v_tenant_id uuid;
BEGIN
  IF uid IS NULL THEN RETURN; END IF;

  SELECT true INTO v_exists FROM public.profiles WHERE user_id = uid;

  -- Get a default tenant (first available one) for new users
  SELECT id INTO v_tenant_id FROM public.tenants WHERE status = 'active' ORDER BY created_at LIMIT 1;
  
  IF NOT v_exists THEN
    INSERT INTO public.profiles(
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
      uid, 
      COALESCE(p_full_name, ''), 
      '', 
      v_tenant_id,
      COALESCE(p_default_role, 'talent')::user_role, 
      'active', 
      now(),
      false
    );
  ELSE
    UPDATE public.profiles
    SET status = 'active',
        role = COALESCE(role, p_default_role::user_role),
        approved_at = COALESCE(approved_at, now())
    WHERE user_id = uid;
  END IF;
END
$$;