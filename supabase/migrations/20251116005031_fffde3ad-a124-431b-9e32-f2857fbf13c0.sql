-- Create email_preferences table
CREATE TABLE email_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Email preference flags
  welcome_emails BOOLEAN DEFAULT true,
  new_video_emails BOOLEAN DEFAULT true,
  general_emails BOOLEAN DEFAULT true,
  
  -- Unsubscribe system
  unsubscribe_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  
  UNIQUE(user_id)
);

-- RLS policies for email_preferences
ALTER TABLE email_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own email preferences"
  ON email_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own email preferences"
  ON email_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert email preferences"
  ON email_preferences FOR INSERT
  WITH CHECK (true);

-- Create email_logs table
CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  status TEXT DEFAULT 'sent',
  error_message TEXT,
  resend_message_id TEXT
);

CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at);

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name, display_name, user_type, email_notifications, welcome_popup_shown)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'visitor'),
    COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, true),
    false
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    email = EXCLUDED.email,
    name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    display_name = COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    user_type = COALESCE(NEW.raw_user_meta_data->>'user_type', profiles.user_type),
    email_notifications = COALESCE((NEW.raw_user_meta_data->>'email_notifications')::boolean, profiles.email_notifications),
    updated_at = now();
  
  -- Insert email preferences
  INSERT INTO public.email_preferences (user_id, welcome_emails, new_video_emails, general_emails)
  VALUES (NEW.id, true, true, true)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Trigger welcome email via edge function
  PERFORM net.http_post(
    url := 'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/send-welcome-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    ),
    body := jsonb_build_object(
      'userId', NEW.id,
      'email', NEW.email,
      'name', COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new video notifications
CREATE OR REPLACE FUNCTION public.notify_subscribers_via_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call edge function to send email notifications
  PERFORM net.http_post(
    url := 'https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/send-video-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg'
    ),
    body := jsonb_build_object(
      'videoId', NEW.id,
      'channelId', NEW.channel_id,
      'channelName', NEW.channel_name,
      'videoTitle', NEW.title,
      'thumbnailUrl', NEW.thumbnail,
      'videoUrl', 'https://yidvid.com/video/' || NEW.video_id
    )
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger on youtube_videos table
DROP TRIGGER IF EXISTS on_new_video_send_emails ON youtube_videos;
CREATE TRIGGER on_new_video_send_emails
  AFTER INSERT ON youtube_videos
  FOR EACH ROW
  EXECUTE FUNCTION notify_subscribers_via_email();