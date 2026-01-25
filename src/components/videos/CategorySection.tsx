
import { useMemo } from "react";
import { VideoCarouselSection } from "./VideoCarouselSection";
import { VideoData } from "@/hooks/video/types/video-fetcher";

interface CategorySectionProps {
  videos: VideoData[];
  category: string;
  categoryLabel: string;
}

export const CategorySection = ({ videos, category, categoryLabel }: CategorySectionProps) => {
  // Filter videos by category
  const categoryVideos = useMemo(() => {
    return videos
      .filter(video => video.category === category)
      .slice(0, 15);
  }, [videos, category]);

  if (categoryVideos.length < 3) return null;

  return (
    <VideoCarouselSection
      title={categoryLabel}
      videos={categoryVideos}
      seeAllLink={`/videos?category=${category}`}
      videosPerView={5}
    />
  );
};
