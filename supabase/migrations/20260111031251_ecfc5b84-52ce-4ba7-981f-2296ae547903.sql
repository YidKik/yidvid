-- Drop existing insert policies for channel_requests
DROP POLICY IF EXISTS "Users can create channel requests" ON channel_requests;
DROP POLICY IF EXISTS "Users can create their own channel requests" ON channel_requests;

-- Make user_id nullable for anonymous requests
ALTER TABLE channel_requests ALTER COLUMN user_id DROP NOT NULL;

-- Create new policy allowing anyone to insert channel requests
CREATE POLICY "Anyone can submit channel requests" 
ON channel_requests 
FOR INSERT 
TO public 
WITH CHECK (
  -- Either logged in and user_id matches, or anonymous (user_id is null)
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_id IS NULL)
);