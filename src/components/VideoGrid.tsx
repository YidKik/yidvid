
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channelName: string;
  channelId: string;
  views: number | null;
  uploadedAt: string | Date;
}

interface VideoGridProps {
  videos: Video[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
  className?: string;
}

export const VideoGrid = ({
  videos,
  maxVideos = 12,
  rowSize = 4,
  isLoading = false,
  className,
}: VideoGridProps) => {
  const isMobile = useIsMobile();
  const [videosToDisplay, setDisplayVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .order("uploaded_at", { ascending: false }) // Order by upload date, newest first
        .limit(100); 
      
      if (error) {
        console.error("Error fetching videos:", error);
      } else {
        // Map the Supabase data to match our Video interface
        const mappedVideos = data.map(video => ({
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || '/placeholder.svg',
          channelName: video.channel_name || "Unknown Channel",
          channelId: video.channel_id || "unknown-channel",
          views: typeof video.views === 'number' ? video.views : 0,
          uploadedAt: video.uploaded_at || new Date().toISOString(),
        }));
        
        // Limit to maxVideos, still ordered by newest first
        const orderedVideos = mappedVideos.slice(0, maxVideos);
        setDisplayVideos(orderedVideos || []);
      }
      setLoading(false);
    };

    fetchVideos();
  }, [maxVideos]);

  // On main page, use a simpler loading indicator
  if (loading) {
    return (
      <div
        className={cn(
          "flex items-center justify-center",
          isMobile ? "min-h-[200px]" : "min-h-[400px]"
        )}
      >
        <LoadingAnimation
          size={isMobile ? "small" : "medium"}
          color="primary"
          text="Loading videos..."
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid",
        isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`,
        className
      )}
    >
      {videosToDisplay.map((video) => (
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
          />
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;
