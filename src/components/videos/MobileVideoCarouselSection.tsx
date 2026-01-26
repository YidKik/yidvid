
import { Link } from "react-router-dom";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { ChevronRight } from "lucide-react";
import { useVideoDate } from "@/components/video/useVideoDate";

interface MobileVideoCarouselSectionProps {
  title: string;
  videos: VideoData[];
  seeAllLink?: string;
  hasBackground?: boolean;
}

export const MobileVideoCarouselSection = ({
  title,
  videos,
  seeAllLink,
  hasBackground = false,
}: MobileVideoCarouselSectionProps) => {
  const { getFormattedDate } = useVideoDate();
  
  if (!videos || videos.length === 0) return null;

  return (
    <section className={`mb-4 ${hasBackground ? 'py-4 px-2 -mx-2 bg-muted/30 rounded-xl' : ''}`}>
      {/* Header - YouTube style, smaller */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </h2>
        {seeAllLink && (
          <Link 
            to={seeAllLink}
            className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-0.5"
          >
            View all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/video/${video.video_id || video.id}`}
              className="flex-none w-[160px] group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-sm">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              
              {/* Video Info */}
              <div className="mt-2 flex gap-2">
                {/* Channel Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-red-500 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                  {video.channel_name.charAt(0).toUpperCase()}
                </div>
                
                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <h3 className="text-xs font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  {/* Channel Name */}
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                    {video.channel_name}
                  </p>
                  {/* Meta */}
                  <p className="text-[10px] text-muted-foreground">
                    {getFormattedDate(video.uploaded_at)} • {video.views?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
