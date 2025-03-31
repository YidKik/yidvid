
-- Create a security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.get_authenticated_user_id()
RETURNS uuid
LANGUAGE sql SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid()
$$;

-- Fix the profiles table Row Level Security by replacing any recursive policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;

-- Re-enable RLS with non-recursive policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT 
  USING (id = public.get_authenticated_user_id() OR (SELECT is_admin FROM profiles WHERE id = public.get_authenticated_user_id()));

-- Create policy that allows users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (id = public.get_authenticated_user_id());

-- Policy that allows users to see all public channel data
CREATE POLICY "Enable public read access for youtube_channels" 
ON public.youtube_channels
FOR SELECT 
USING (
  deleted_at IS NULL
);

-- Enable public read access for videos
CREATE POLICY "Enable public read access for youtube_videos" 
ON public.youtube_videos
FOR SELECT 
USING (
  deleted_at IS NULL
);
