
CREATE OR REPLACE FUNCTION public.notify_admins_of_reported_video()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  video_title text;
BEGIN
    SELECT title INTO video_title FROM youtube_videos WHERE id = NEW.video_id;
    INSERT INTO admin_notifications (type, content)
    VALUES (
        'reported_video',
        format('Video reported: %s by %s', COALESCE(video_title, 'Unknown'), NEW.email)
    );
    RETURN NEW;
END;
$function$;

CREATE TRIGGER on_video_report_notify_admins
  AFTER INSERT ON public.video_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_of_reported_video();
