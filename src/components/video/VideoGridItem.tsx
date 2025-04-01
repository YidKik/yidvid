
import { cn } from "@/lib/utils";
import { VideoCard } from "@/components/VideoCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { YoutubeChannelsTable } from "@/integrations/supabase/types/youtube-channels";

interface VideoGridItemProps {
  video: VideoItemType;
}

export const VideoGridItem = ({ video }: VideoGridItemProps) => {
  const { isMobile } = useIsMobile();
  const [channelThumbnail, setChannelThumbnail] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchChannelThumbnail = async () => {
      if (!video.channelId) return;
      
      try {
        const { data, error } = await supabase
          .from("youtube_channels")
          .select("thumbnail_url")
          .eq("channel_id", video.channelId)
          .single();
        
        if (error) {
          console.error("Error fetching channel thumbnail:", error);
          return;
        }
        
        if (data?.thumbnail_url) {
          setChannelThumbnail(data.thumbnail_url);
        }
      } catch (err) {
        console.error("Error in channel thumbnail fetch:", err);
      }
    };
    
    fetchChannelThumbnail();
  }, [video.channelId]);
  
  return (
    <div
      key={video.id || `video-${Math.random()}`}
      className={cn("w-full flex flex-col", isMobile && "mb-2")}
    >
      <VideoCard
        id={video.id}
        video_id={video.video_id}
        title={video.title || "Untitled Video"}
        thumbnail={video.thumbnail || "/placeholder.svg"}
        channelName={video.channelName || "Unknown Channel"}
        channelId={video.channelId}
        views={video.views || 0}
        uploadedAt={video.uploadedAt}
        channelThumbnail={channelThumbnail || undefined}
        hideChannelName={true}
      />
    </div>
  );
};
