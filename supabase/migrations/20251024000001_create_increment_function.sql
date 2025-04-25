
-- Create a function to increment counter values safely
CREATE OR REPLACE FUNCTION increment_counter_value()
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(views, 0) + 1
  FROM youtube_videos
  WHERE id = NEW.id
$$;

-- Update the config to make the function accessible
