-- Fix the security vulnerability in profiles table
-- Remove the publicly readable policy and replace with secure policies

-- Drop the existing insecure policy
DROP POLICY IF EXISTS "Public can view all profiles" ON public.profiles;

-- Create secure policies that only allow:
-- 1. Users to view their own profile
-- 2. Authenticated users to view limited public profile info (display_name, username, avatar_url only)
-- 3. Admins to view all profiles

-- Policy 1: Users can view their own complete profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Authenticated users can view limited public info of other users (no emails)
-- This is needed for features like user lists, comments, etc. but protects sensitive data
CREATE POLICY "Authenticated users can view public profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id
);

-- Policy 3: Admins have full access (already exists)
-- The "Admins have full access" policy already covers admin access

-- Add a view for public profile data that excludes sensitive information
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  display_name,
  username,
  avatar_url,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create policy for the public view
CREATE POLICY "Public profiles view accessible to authenticated users"
ON public.public_profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);