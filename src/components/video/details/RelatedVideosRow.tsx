import { VideoCard } from "@/components/VideoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

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

interface RelatedVideosRowProps {
  videos?: Video[];
  isLoading?: boolean;
  channelName?: string;
}

export const RelatedVideosRow = ({ 
  videos, 
  isLoading = false,
  channelName = "this channel"
}: RelatedVideosRowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">More from {channelName}</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">More from {channelName}</h2>
        <p className="text-muted-foreground text-sm text-center py-6">
          No other videos found from this channel
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/80 backdrop-blur-sm rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            More from {channelName}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {videos.length} video{videos.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Navigation arrows */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="h-8 w-8 rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="h-8 w-8 rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Scrollable videos row */}
      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto pb-5 px-5 scrollbar-hide"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {videos.slice(0, 12).map((video) => (
          <div 
            key={video.id}
            className="flex-shrink-0 w-52 group hover:scale-[1.02] transition-transform"
            style={{ scrollSnapAlign: 'start' }}
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
              hideChannelName
            />
          </div>
        ))}
      </div>
    </div>
  );
};
