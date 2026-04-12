CREATE OR REPLACE FUNCTION public.notify_admins_of_new_comment()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    INSERT INTO admin_notifications (type, content)
    VALUES (
        'new_comment',
        format('New comment added by %s on video %s', 
            COALESCE(
                (SELECT username FROM profiles WHERE id = NEW.user_id),
                (SELECT display_name FROM profiles WHERE id = NEW.user_id),
                (SELECT email FROM profiles WHERE id = NEW.user_id),
                'Anonymous'
            ),
            COALESCE((SELECT title FROM youtube_videos WHERE id = NEW.video_id::uuid), 'Unknown Video')
        )
    );
    RETURN NEW;
END;
$function$;