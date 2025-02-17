
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface VideoHistoryProps {
  videoId: string;
}

export const VideoHistory = ({ videoId }: VideoHistoryProps) => {
  useEffect(() => {
    const addToHistory = async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) return;

      const { error } = await supabase
        .from("video_history")
        .insert({
          video_id: videoId,
          user_id: session.session.user.id,
        });

      if (error) {
        console.error("Error adding video to history:", error);
      }
    };

    addToHistory();
  }, [videoId]);

  return null;
};
