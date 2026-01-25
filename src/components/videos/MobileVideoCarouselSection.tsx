
import { Link } from "react-router-dom";
import { VideoCard } from "@/components/VideoCard";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { ChevronRight } from "lucide-react";

interface MobileVideoCarouselSectionProps {
  title: string;
  videos: VideoData[];
  seeAllLink?: string;
}

export const MobileVideoCarouselSection = ({
  title,
  videos,
  seeAllLink,
}: MobileVideoCarouselSectionProps) => {
  if (!videos || videos.length === 0) return null;

  return (
    <section className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-base font-bold text-foreground" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          {title}
        </h2>
        {seeAllLink && (
          <Link 
            to={seeAllLink}
            className="text-xs font-medium text-primary flex items-center gap-0.5"
          >
            See all
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide -mx-2 px-2">
        <div className="flex gap-3" style={{ width: 'max-content' }}>
          {videos.map((video) => (
            <div
              key={video.id}
              className="flex-none w-[160px]"
            >
              <VideoCard
                id={video.id}
                video_id={video.video_id}
                title={video.title}
                thumbnail={video.thumbnail}
                channelName={video.channel_name}
                channelId={video.channel_id}
                views={video.views}
                uploadedAt={video.uploaded_at}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
