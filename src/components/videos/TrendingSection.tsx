
import { useMemo } from "react";
import { VideoCarouselSection } from "./VideoCarouselSection";
import { VideoData } from "@/hooks/video/types/video-fetcher";

interface TrendingSectionProps {
  videos: VideoData[];
}

export const TrendingSection = ({ videos }: TrendingSectionProps) => {
  // Sort by views to get trending videos
  const trendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 15);
  }, [videos]);

  return (
    <VideoCarouselSection
      title="Trending"
      videos={trendingVideos}
      seeAllLink="/videos?sort=trending"
      videosPerView={5}
    />
  );
};
