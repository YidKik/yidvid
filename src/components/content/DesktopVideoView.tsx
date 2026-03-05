
import { FeaturedVideoSection } from "@/components/videos/FeaturedVideoSection";
import { NewVideosSection } from "@/components/videos/NewVideosSection";
import { TrendingSection } from "@/components/videos/TrendingSection";
import { ChannelsRowSection } from "@/components/videos/ChannelsRowSection";
import { CategoryVideosGrid } from "@/components/videos/CategoryVideosGrid";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  selectedCategory?: string;
  sortBy?: string;
  viewChannels?: boolean;
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch,
  selectedCategory = "all",
  sortBy,
  viewChannels = false
}: DesktopVideoViewProps) => {
  const { isMobile, isTablet } = useIsMobile();
  // More thorough check if we have real videos (not samples)
  const hasRealVideos = videos.some(video => 
    !video.id.toString().includes('sample') && 
    !video.video_id.includes('sample') &&
    video.channel_name !== "Sample Channel" &&
    video.title !== "Sample Video 1"
  );

  // Get featured videos - highest views in the last 7 days
  const featuredVideos = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return [...videos]
      .filter(v => new Date(v.uploaded_at) >= oneWeekAgo)
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 6);
  }, [videos]);

  const containerPadding = isMobile ? 'px-3' : isTablet ? 'px-4' : 'px-8 lg:px-12 xl:px-16';
  const sectionSpacing = isMobile ? 'space-y-4' : 'space-y-6';

  // Reserve layout while loading to prevent mobile scroll jumps/layout shifts
  if (isLoading && videos.length === 0) {
    return (
      <div className={`flex items-center justify-center ${isMobile ? 'min-h-[200px]' : 'min-h-[400px]'} ${containerPadding} max-w-[1600px] mx-auto`}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasRealVideos || videos.length === 0) {
    return null;
  }

  // If viewing channels only, skip all video sections
  if (viewChannels) {
    return (
      <div className={`${containerPadding} max-w-[1600px] mx-auto`}>
        <ChannelsRowSection selectedCategory={selectedCategory} autoExpand={true} />
      </div>
    );
  }

  if (selectedCategory !== "all") {
    return (
      <div className={`space-y-8 ${containerPadding} max-w-[1600px] mx-auto`}>
        <CategoryVideosGrid videos={videos} categoryId={selectedCategory} />
        <ChannelsRowSection selectedCategory={selectedCategory} />
      </div>
    );
  }

  return (
    <div className={`${sectionSpacing} ${containerPadding} max-w-[1600px] mx-auto`}>
      {/* Featured Section - Large hero cards */}
      {featuredVideos.length >= 3 && (
        <FeaturedVideoSection videos={featuredVideos} />
      )}

      {/* New Videos Section */}
      <NewVideosSection videos={videos} autoExpand={sortBy === 'newest'} />

      {/* Trending Section - Different style */}
      <TrendingSection videos={videos} />

      {/* Most Viewed Channels */}
      <ChannelsRowSection selectedCategory={selectedCategory} />
    </div>
  );
};
