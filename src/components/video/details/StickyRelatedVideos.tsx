import { useEffect, useState, useRef } from "react";
import { VideoCard } from "../../VideoCard";

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
  const [stickyTop, setStickyTop] = useState(80);
  const [maxHeight, setMaxHeight] = useState('calc(100vh - 120px)');
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateStickyPosition = () => {
      if (!pageContentRef?.current || !sidebarRef.current) return;

      const pageContent = pageContentRef.current;
      const sidebar = sidebarRef.current;
      const sidebarRect = sidebar.getBoundingClientRect();
      const pageRect = pageContent.getBoundingClientRect();
      
      // Calculate how much content is below the fold
      const pageHeight = pageRect.height;
      const viewportHeight = window.innerHeight;
      const scrollY = window.scrollY;
      
      // Dynamic top position based on scroll
      const newTop = Math.max(80, 120 - scrollY);
      setStickyTop(newTop);
      
      // Calculate available height for videos
      const availableHeight = Math.min(
        viewportHeight - newTop - 40, // 40px bottom padding
        pageHeight - scrollY + pageRect.top - newTop
      );
      
      setMaxHeight(`${Math.max(300, availableHeight)}px`);
    };

    updateStickyPosition();
    window.addEventListener('scroll', updateStickyPosition, { passive: true });
    window.addEventListener('resize', updateStickyPosition);

    return () => {
      window.removeEventListener('scroll', updateStickyPosition);
      window.removeEventListener('resize', updateStickyPosition);
    };
  }, [pageContentRef]);

  if (isLoading) {
    return (
      <div 
        ref={sidebarRef}
        className="sticky transition-all duration-300 ease-out"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="bg-card/20 rounded-xl p-4 backdrop-blur-sm border border-border/30">
          <div className="animate-pulse space-y-4">
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
        className="sticky transition-all duration-300 ease-out"
        style={{ top: `${stickyTop}px` }}
      >
        <div className="bg-card/20 rounded-xl p-6 backdrop-blur-sm border border-border/30 text-center">
          <p className="text-muted-foreground text-sm">No other videos found from this channel</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={sidebarRef}
      className="sticky transition-all duration-300 ease-out"
      style={{ top: `${stickyTop}px` }}
    >
      <div className="bg-card/10 rounded-xl backdrop-blur-sm border border-border/20 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/20">
          <h2 className="text-lg font-semibold text-foreground">More from this channel</h2>
        </div>
        
        <div 
          className="overflow-y-auto scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent hover:scrollbar-thumb-border/60 transition-colors"
          style={{ maxHeight }}
        >
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