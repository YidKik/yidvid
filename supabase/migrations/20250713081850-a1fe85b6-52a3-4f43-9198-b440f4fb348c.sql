-- Update the existing is_admin_user function to use the new approach
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT public.is_user_admin(user_id);
$$;