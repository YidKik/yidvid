import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { VideoCard } from "./VideoCard";
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { useEffect, useState, useRef } from "react";
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
  const { isMobile } = useIsMobile();
  const location = useLocation();
  const [videosToDisplay, setVideosToDisplay] = useState<Video[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [visibleVideos, setVisibleVideos] = useState<Video[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!gridRef.current || videosToDisplay.length === 0) return;
    
    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1
    };
    
    const videoElements = gridRef.current.querySelectorAll('.video-card-container');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const videoId = entry.target.getAttribute('data-video-id');
          if (videoId) {
            const video = videosToDisplay.find(v => v.id === videoId);
            if (video) {
              setVisibleVideos(prev => {
                if (!prev.some(v => v.id === video.id)) {
                  return [...prev, video];
                }
                return prev;
              });
            }
            
            observer.unobserve(entry.target);
          }
        }
      });
    }, options);
    
    videoElements.forEach(element => {
      observer.observe(element);
    });
    
    return () => {
      observer.disconnect();
    };
  }, [videosToDisplay]);

  useEffect(() => {
    if (videos && videos.length > 0) {
      const formattedVideos = videos.map(video => {
        let validatedDate: string | Date;
        try {
          if (video.uploadedAt) {
            if (video.uploadedAt instanceof Date) {
              if (!isNaN(video.uploadedAt.getTime())) {
                validatedDate = video.uploadedAt;
              } else {
                validatedDate = new Date().toISOString();
              }
            } else {
              const testDate = new Date(video.uploadedAt);
              if (!isNaN(testDate.getTime())) {
                validatedDate = video.uploadedAt;
              } else {
                validatedDate = new Date().toISOString();
              }
            }
          } else {
            validatedDate = new Date().toISOString();
          }
        } catch (err) {
          console.error("Date validation error:", err);
          validatedDate = new Date().toISOString();
        }

        return {
          id: video.id,
          video_id: video.video_id,
          title: video.title || "Untitled Video",
          thumbnail: video.thumbnail || "/placeholder.svg",
          channelName: video.channelName || "Unknown Channel",
          channelId: video.channelId,
          views: video.views || 0,
          uploadedAt: validatedDate
        };
      });

      setVideosToDisplay(formattedVideos);
      
      const initialVisibleCount = Math.min(formattedVideos.length, isMobile ? 4 : 8);
      setVisibleVideos(formattedVideos.slice(0, initialVisibleCount));
      
      setLoading(false);
      return;
    }

    const fetchVideos = async () => {
      setLoading(true);
      try {
        const initialLimit = isMobile ? 4 : 12;
        
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("id", { ascending: false })
          .limit(initialLimit);

        if (error) {
          console.error("Error fetching videos:", error);
          return;
        }

        if (data) {
          const processedData = data.map(video => {
            let validUploadedAt: string;
            try {
              if (video.uploaded_at) {
                const testDate = new Date(video.uploaded_at);
                validUploadedAt = !isNaN(testDate.getTime()) 
                  ? video.uploaded_at 
                  : new Date().toISOString();
              } else {
                validUploadedAt = new Date().toISOString();
              }
            } catch (err) {
              console.error("Date processing error:", err);
              validUploadedAt = new Date().toISOString();
            }

            return {
              id: video.id,
              video_id: video.video_id,
              title: video.title || "Untitled Video",
              thumbnail: video.thumbnail || "/placeholder.svg",
              channelName: video.channel_name || "Unknown Channel",
              channelId: video.channel_id,
              views: video.views || 0,
              uploadedAt: validUploadedAt
            };
          });
          
          setVideosToDisplay(processedData);
          setVisibleVideos(processedData);
          
          setTimeout(() => {
            fetchMoreVideos(initialLimit);
          }, 2000);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchMoreVideos = async (initialLimit: number) => {
      try {
        const { data, error } = await supabase
          .from("youtube_videos")
          .select("*")
          .order("id", { ascending: false })
          .range(initialLimit, initialLimit + 88);

        if (error) {
          console.error("Error fetching more videos:", error);
          return;
        }

        if (data && data.length > 0) {
          const processedData = data.map(video => {
            let validUploadedAt: string;
            try {
              if (video.uploaded_at) {
                const testDate = new Date(video.uploaded_at);
                validUploadedAt = !isNaN(testDate.getTime()) 
                  ? video.uploaded_at 
                  : new Date().toISOString();
              } else {
                validUploadedAt = new Date().toISOString();
              }
            } catch (err) {
              console.error("Date processing error:", err);
              validUploadedAt = new Date().toISOString();
            }

            return {
              id: video.id,
              video_id: video.video_id,
              title: video.title || "Untitled Video",
              thumbnail: video.thumbnail || "/placeholder.svg",
              channelName: video.channel_name || "Unknown Channel",
              channelId: video.channel_id,
              views: video.views || 0,
              uploadedAt: validUploadedAt
            };
          });
          
          setVideosToDisplay(prev => [...prev, ...processedData]);
          console.log(`Loaded ${processedData.length} additional videos in the background`);
        }
      } catch (err) {
        console.error("Error in background fetch:", err);
      }
    };

    fetchVideos();
  }, [videos, maxVideos, isMobile]);

  if (isLoading || loading) {
    return (
      <div className={cn("flex items-center justify-center", isMobile ? "min-h-[200px]" : "min-h-[400px]")}>
        <LoadingAnimation size={isMobile ? "small" : "medium"} color="primary" text="Loading videos..." />
      </div>
    );
  }

  return (
    <div ref={gridRef} className={cn("grid", isMobile ? "grid-cols-2 gap-x-2 gap-y-3" : `grid-cols-${rowSize} gap-4`, className)}>
      {videosToDisplay.length > 0 ? (
        videosToDisplay.map((video) => (
          <div 
            key={video.id} 
            className={cn("w-full flex flex-col video-card-container", isMobile && "mb-2")}
            data-video-id={video.id}
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
              isLazy={!visibleVideos.some(v => v.id === video.id)}
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
