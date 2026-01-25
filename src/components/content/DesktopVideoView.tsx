
import { FeaturedVideoSection } from "@/components/videos/FeaturedVideoSection";
import { NewVideosSection } from "@/components/videos/NewVideosSection";
import { TrendingSection } from "@/components/videos/TrendingSection";
import { ChannelsRowSection } from "@/components/videos/ChannelsRowSection";
import { CategorySection } from "@/components/videos/CategorySection";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useMemo } from "react";

interface DesktopVideoViewProps {
  videos: VideoData[];
  isLoading: boolean;
  isRefreshing: boolean;
  refetch?: () => Promise<any>;
  forceRefetch?: () => Promise<any>;
  lastSuccessfulFetch?: Date | null;
  fetchAttempts?: number;
  selectedCategory?: string;
}

export const DesktopVideoView = ({
  videos,
  isLoading,
  isRefreshing,
  refetch,
  forceRefetch,
  selectedCategory = "all"
}: DesktopVideoViewProps) => {
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
      .slice(0, 4);
  }, [videos]);

  // Categories for sections
  const categories = [
    { key: "music", label: "Music" },
    { key: "torah", label: "Torah" },
    { key: "inspiration", label: "Inspiration" },
    { key: "education", label: "Education" },
    { key: "entertainment", label: "Entertainment" },
  ];

  // Only render when we have real videos to show - prevents staggered loading
  if (!hasRealVideos || videos.length === 0) {
    return null;
  }

  // If a specific category is selected, show filtered grid view
  if (selectedCategory !== "all") {
    const filteredVideos = videos.filter(v => v.category === selectedCategory);
    return (
      <div className="space-y-8">
        <TrendingSection videos={filteredVideos} />
        <NewVideosSection videos={filteredVideos} />
        <ChannelsRowSection selectedCategory={selectedCategory} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Section - Large hero cards */}
      {featuredVideos.length >= 4 && (
        <FeaturedVideoSection videos={featuredVideos} />
      )}

      {/* New Videos Section */}
      <NewVideosSection videos={videos} />

      {/* Trending Section */}
      <TrendingSection videos={videos} />

      {/* Channels Row */}
      <ChannelsRowSection selectedCategory={selectedCategory} />

      {/* Category Sections */}
      {categories.map(cat => (
        <CategorySection 
          key={cat.key}
          videos={videos}
          category={cat.key}
          categoryLabel={cat.label}
        />
      ))}
    </div>
  );
};
