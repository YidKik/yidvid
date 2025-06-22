
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUnifiedAuth } from "@/hooks/useUnifiedAuth";

interface VideoHistoryProps {
  videoId: string;
}

export const VideoHistory = ({ videoId }: VideoHistoryProps) => {
  const { isAuthenticated, user } = useUnifiedAuth();

  useEffect(() => {
    const addToHistory = async () => {
      try {
        if (!isAuthenticated || !user?.id) {
          console.log("User not authenticated, skipping history recording");
          return;
        }

        console.log("Adding video to history:", { videoId, userId: user.id });

        const { error } = await supabase
          .from("video_history")
          .insert({
            video_id: videoId,
            user_id: user.id,
          });

        if (error) {
          console.error("Error adding video to history:", error);
          // Don't show error toast to user for a background operation
        } else {
          console.log("Video successfully added to history");
        }
      } catch (err) {
        console.error("Unexpected error in VideoHistory component:", err);
      }
    };

    if (videoId && isAuthenticated && user?.id) {
      addToHistory();
    }
  }, [videoId, isAuthenticated, user?.id]);

  return null;
};
