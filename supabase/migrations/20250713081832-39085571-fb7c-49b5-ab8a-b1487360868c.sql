-- Fix infinite recursion in profiles RLS policies
-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Allow admins full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Basic profile read access" ON profiles; 
DROP POLICY IF EXISTS "Enable admin operations" ON profiles;
DROP POLICY IF EXISTS "Enable delete access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable update access for users based on email" ON profiles;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS public.get_authenticated_user_id();

-- Create a proper security definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(is_admin, false) FROM profiles WHERE id = user_id;
$$;

-- Create clean, non-recursive policies
CREATE POLICY "Public can view all profiles" ON profiles
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" ON profiles
  FOR DELETE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access" ON profiles
  FOR ALL
  USING (public.is_user_admin(auth.uid()))
  WITH CHECK (public.is_user_admin(auth.uid()));