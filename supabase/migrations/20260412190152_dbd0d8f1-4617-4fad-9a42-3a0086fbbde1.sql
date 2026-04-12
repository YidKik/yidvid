
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, name, display_name, username, user_type, email_notifications, welcome_popup_shown, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'visitor'),
    COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, true),
    false,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    username = COALESCE(EXCLUDED.username, profiles.username),
    user_type = COALESCE(NEW.raw_user_meta_data->>'user_type', profiles.user_type),
    email_notifications = COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, profiles.email_notifications),
    avatar_url = COALESCE(profiles.avatar_url, NEW.raw_user_meta_data->>'avatar_url'),
    updated_at = now();
  
  INSERT INTO public.email_preferences (user_id, welcome_emails, new_video_emails, general_emails)
  VALUES (NEW.id, true, true, true)
  ON CONFLICT (user_id) DO NOTHING;
  
  PERFORM net.http_post(
    url := 'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    ),
    body := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
  );
  
  RETURN NEW;
END;
$function$;
