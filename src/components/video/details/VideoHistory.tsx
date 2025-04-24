
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VideoHistoryProps {
  videoId: string;
}

export const VideoHistory = ({ videoId }: VideoHistoryProps) => {
  useEffect(() => {
    const addToHistory = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session?.user) {
          console.log("User not authenticated, skipping history recording");
          return;
        }

        const { error } = await supabase
          .from("video_history")
          .insert({
            video_id: videoId,
            user_id: session.session.user.id,
          });

        if (error) {
          console.error("Error adding video to history:", error);
          // Don't show error toast to user for a background operation
        }
      } catch (err) {
        console.error("Unexpected error in VideoHistory component:", err);
      }
    };

    if (videoId) {
      addToHistory();
    }
  }, [videoId]);

  return null;
};
