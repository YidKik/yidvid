
-- This file is kept for historical purposes, but the function is no longer used directly.
-- We are now using RPC to increment the counter safely.

-- Define an increment function that can be called via RPC
CREATE OR REPLACE FUNCTION public.increment_counter()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  -- This function returns the value 1, which will be used by the update operation to add to the current value
  SELECT 1;
$$;

-- Grant usage to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.increment_counter() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_counter() TO anon;
