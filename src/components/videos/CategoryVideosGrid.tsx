import { useMemo } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";
import { VideoCardWithOptions } from "@/components/video/VideoCardWithOptions";
import { useCategories } from "@/hooks/useCategories";

interface CategoryVideosGridProps {
  videos: VideoData[];
  categoryId: string;
}

export const CategoryVideosGrid = ({ videos, categoryId }: CategoryVideosGridProps) => {
  const { getFormattedDate } = useVideoDate();
  const { allCategories } = useCategories();

  // Find category label
  const categoryLabel = useMemo(() => {
    const category = allCategories.find(c => c.id === categoryId);
    return category?.label || categoryId;
  }, [allCategories, categoryId]);

  // Filter and sort videos by category
  const categoryVideos = useMemo(() => {
    return videos
      .filter(v => v.category === categoryId)
      .sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime());
  }, [videos, categoryId]);

  // Show 4 rows of 4 videos = 16 videos
  const displayVideos = categoryVideos.slice(0, 16);

  if (displayVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos found in this category</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex items-center gap-3">
        <h2 
          className="text-2xl font-bold text-gray-800"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          {categoryLabel} Videos
        </h2>
        <span className="text-sm text-gray-500">
          ({categoryVideos.length} videos)
        </span>
      </div>

      {/* 4 rows grid */}
      <div className="grid grid-cols-4 gap-4">
        {displayVideos.map((video) => (
          <VideoCardWithOptions
            key={video.id}
            videoId={video.video_id}
            videoUuid={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            channelName={video.channel_name}
            views={video.views}
            formattedDate={getFormattedDate(video.uploaded_at)}
            duration={video.duration}
          />
        ))}
      </div>

      {/* Show more indicator if there are more videos */}
      {categoryVideos.length > 16 && (
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Showing 16 of {categoryVideos.length} videos
          </p>
        </div>
      )}
    </div>
  );
};
