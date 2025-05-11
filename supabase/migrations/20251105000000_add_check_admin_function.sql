
-- Create function to check if a user is an admin
-- This avoids RLS recursion by allowing a direct admin check
CREATE OR REPLACE FUNCTION public.check_admin_status(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_admin_value BOOLEAN;
BEGIN
  -- Direct query to check admin status without going through RLS
  SELECT is_admin INTO is_admin_value
  FROM public.profiles
  WHERE id = user_id_param;
  
  -- Return the result or false if no row found
  RETURN COALESCE(is_admin_value, false);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.check_admin_status TO authenticated;
