
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { VideoData } from "@/hooks/video/types/video-fetcher";

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
  videos?: VideoData[];
  maxVideos?: number;
  rowSize?: number;
  className?: string;
  isLoading?: boolean;
}

export const VideoGrid = ({
  videos,
  maxVideos = 12,
  rowSize = 4,
  className,
  isLoading = false,
}: VideoGridProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [videosToDisplay, setVideosToDisplay] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // If videos are provided as a prop, use them
    if (videos && videos.length > 0) {
      // Convert VideoData format to Video format
      const formattedVideos = videos.map(video => ({
        id: video.id,
        video_id: video.video_id,
        title: video.title || "Untitled Video",
        thumbnail: video.thumbnail || "/placeholder.svg",
        channelName: video.channelName || "Unknown Channel",
        channelId: video.channelId,
        views: video.views || 0,
        uploadedAt: isValidDate(video.uploadedAt) ? video.uploadedAt : new Date().toISOString()
      }));

      setVideosToDisplay(formattedVideos);
      setLoading(false);
      return;
    }

    // If no videos are provided, fetch them from the database
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("id", { ascending: false })
          .limit(100);

        if (error) {
          console.error("Error fetching videos:", error);
          return;
        }

        if (data) {
          // Process the data to ensure valid date objects
          const processedData = data.map(video => ({
            id: video.id,
            video_id: video.video_id,
            title: video.title || "Untitled Video",
            thumbnail: video.thumbnail || "/placeholder.svg",
            channelName: video.channel_name || "Unknown Channel",
            channelId: video.channel_id,
            views: video.views || 0,
            // Ensure we have a valid date or default to current date
            uploadedAt: isValidDate(video.uploaded_at) ? video.uploaded_at : new Date().toISOString()
          }));
          
          const shuffledVideos = processedData
            .sort(() => 0.5 - Math.random())
            .slice(0, maxVideos);
          
          setVideosToDisplay(shuffledVideos);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [videos, maxVideos]); // Dependency ensures correct re-fetch behavior

  // Helper function to validate dates
  const isValidDate = (dateString: string | null | undefined): boolean => {
    if (!dateString) return false;
    
    // Try to create a date object
    const date = new Date(dateString);
    
    // Check if the date is valid and not NaN
    return !isNaN(date.getTime());
  };

  if (isLoading || loading) {
    return (
      <div className={cn("flex items-center justify-center", isMobile ? "min-h-[200px]" : "min-h-[400px]")}>
        <LoadingAnimation size={isMobile ? "small" : "medium"} color="primary" text="Loading videos..." />
      </div>
    );
  }

  return (
    <div className={cn("grid", isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`, className)}>
      {videosToDisplay.length > 0 ? (
        videosToDisplay.map((video) => (
          <div key={video.id} className={cn("w-full flex flex-col", isMobile && "mb-2")}>
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
        ))
      ) : (
        <p className="text-center text-gray-500">No videos found.</p>
      )}
    </div>
  );
};

export default VideoGrid;
