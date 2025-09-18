import { useEffect, useState, useRef } from "react";
import { VideoCard } from "../../VideoCard";
import { useSize } from "@/hooks/use-size";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number;
  uploaded_at: string | Date;
}

interface StickyRelatedVideosProps {
  videos?: Video[];
  isLoading?: boolean;
  pageContentRef?: React.RefObject<HTMLElement>;
}

export const StickyRelatedVideos = ({ videos, isLoading = false, pageContentRef }: StickyRelatedVideosProps) => {
  const [setMainContentRef, mainContentSize] = useSize();
  const [calculatedHeight, setCalculatedHeight] = useState('calc(100vh - 200px)');
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pageContentRef?.current) return;
    
    // Set the reference to track the main content size
    setMainContentRef(pageContentRef.current);
  }, [pageContentRef, setMainContentRef]);

  useEffect(() => {
    const calculateHeight = () => {
      if (!pageContentRef?.current || !mainContentSize) return;

      const videoPlayer = pageContentRef.current.querySelector('[class*="relative"]') as HTMLElement;
      const description = pageContentRef.current.querySelector('[class*="space-y-6"] > div:last-child') as HTMLElement;
      
      if (videoPlayer && description) {
        const videoRect = videoPlayer.getBoundingClientRect();
        const descRect = description.getBoundingClientRect();
        
        // Calculate height from video top to description bottom
        const height = descRect.bottom - videoRect.top - 20; // 20px padding
        setCalculatedHeight(`${Math.max(400, height)}px`);
      }
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    
    return () => {
      window.removeEventListener('resize', calculateHeight);
    };
  }, [pageContentRef, mainContentSize]);

  if (isLoading) {
    return (
      <div 
        ref={sidebarRef}
        className="relative"
      >
        <div 
          className="bg-card/20 rounded-xl p-4 backdrop-blur-sm border border-border/30"
          style={{ height: calculatedHeight }}
        >
          <div className="animate-pulse space-y-4 h-full">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-32 h-18 bg-muted rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted/70 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div 
        ref={sidebarRef}
        className="relative"
      >
        <div 
          className="bg-card/20 rounded-xl p-6 backdrop-blur-sm border border-border/30 text-center flex items-center justify-center"
          style={{ height: calculatedHeight }}
        >
          <p className="text-muted-foreground text-sm">No other videos found from this channel</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      className="relative"
    >
      <div 
        className="bg-card/10 rounded-xl backdrop-blur-sm border border-border/20 overflow-hidden shadow-sm"
        style={{ height: calculatedHeight }}
      >
        <div className="p-4 border-b border-border/20 flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">More from this channel</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent hover:scrollbar-thumb-border/60 transition-colors h-[calc(100%-4rem)]">
          <div className="p-2 space-y-3">
            {videos.map((video, index) => (
              <div 
                key={video.id}
                className="group hover:bg-accent/30 rounded-lg p-2 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <VideoCard
                  id={video.id}
                  video_id={video.video_id}
                  title={video.title}
                  thumbnail={video.thumbnail || "/placeholder.svg"}
                  channelName={video.channel_name}
                  channelId={video.channel_id}
                  views={video.views}
                  uploadedAt={video.uploaded_at}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};