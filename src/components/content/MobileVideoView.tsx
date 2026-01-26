
import React, { useMemo } from 'react';
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { MobileVideoCarouselSection } from "@/components/videos/MobileVideoCarouselSection";
import { MobileChannelsRow } from "@/components/videos/MobileChannelsRow";

export interface MobileVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  selectedCategory?: string;
}

export const MobileVideoView: React.FC<MobileVideoViewProps> = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch,
  selectedCategory = "all"
}) => {
  // New videos - sorted by upload date
  const newVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
      .slice(0, 10);
  }, [videos]);

  // Trending videos - sorted by views
  const trendingVideos = useMemo(() => {
    return [...videos]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 10);
  }, [videos]);

  // Only render when we have videos to show - prevents staggered loading
  if (!videos || videos.length === 0) {
    return null;
  }

  // Filtered view for specific category
  if (selectedCategory !== "all") {
    const filteredVideos = videos.filter(v => v.category === selectedCategory);
    return (
      <div className="space-y-6 px-2">
        <MobileVideoCarouselSection title="Latest" videos={filteredVideos.slice(0, 10)} />
        <MobileVideoCarouselSection title="Popular" videos={[...filteredVideos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 10)} />
        <MobileChannelsRow />
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2">
      {/* New Videos */}
      <MobileVideoCarouselSection title="Latest Videos" videos={newVideos} seeAllLink="/videos?sort=newest" isNew />
      
      {/* Trending */}
      <MobileVideoCarouselSection title="Trending" videos={trendingVideos} seeAllLink="/videos?sort=trending" isTrending />
      
      {/* Most Viewed Channels */}
      <MobileChannelsRow />
    </div>
  );
};
