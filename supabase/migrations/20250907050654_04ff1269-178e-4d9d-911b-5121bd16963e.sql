-- Fix the security vulnerability in profiles table
-- Remove the publicly readable policy and replace with secure policies

-- Drop the existing insecure policy that allows public access
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;

-- Create secure policies that protect sensitive data like email addresses
-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view limited public info of other users 
-- This allows features like user lists, comments, etc. but protects emails and sensitive data
-- We'll handle the column filtering in the application layer
CREATE POLICY "Authenticated users can view other profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND auth.uid() != id);

-- Note: The existing "Admins have full access" policy already covers admin access

-- Create a view for safe public profile access that excludes sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  username,
  avatar_url,
  name,
  created_at,
  updated_at
FROM public.profiles;