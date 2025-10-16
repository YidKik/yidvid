-- Fix recursive RLS policy on user_roles to avoid recursion and rely on has_role()
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Ensure public view runs with caller privileges to respect RLS on base tables
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='public_profiles'
  ) THEN
    EXECUTE 'ALTER VIEW public.public_profiles SET (security_invoker = true)';
  END IF;
END$$;