
import { useMemo } from "react";
import { VideoCarouselSection } from "./VideoCarouselSection";
import { VideoData } from "@/hooks/video/types/video-fetcher";

interface NewVideosSectionProps {
  videos: VideoData[];
}

export const NewVideosSection = ({ videos }: NewVideosSectionProps) => {
  // Sort by upload date to get newest videos
  const newVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      .slice(0, 15);
  }, [videos]);

  return (
    <VideoCarouselSection
      title="New Videos"
      videos={newVideos}
      seeAllLink="/videos?sort=newest"
      videosPerView={5}
    />
  );
};
