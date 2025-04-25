
-- Create a function to increment counter values safely
CREATE OR REPLACE FUNCTION increment_counter()
RETURNS integer
LANGUAGE sql
AS $$
  SELECT COALESCE(NEW.views, 0) + 1
$$;
