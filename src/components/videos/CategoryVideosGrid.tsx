import { useMemo, useState } from "react";
import { VideoData } from "@/hooks/video/types/video-fetcher";
import { useVideoDate } from "@/components/video/useVideoDate";
import { VideoCardWithOptions } from "@/components/video/VideoCardWithOptions";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryVideos } from "@/hooks/video/useCategoryVideos";
import { CustomPaginationArrow } from "@/components/ui/custom-pagination-arrow";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CategoryVideosGridProps {
  videos: VideoData[]; // kept for interface compat but we fetch our own
  categoryId: string;
}

export const CategoryVideosGrid = ({ categoryId }: CategoryVideosGridProps) => {
  const { getFormattedDate } = useVideoDate();
  const { allCategories } = useCategories();
  const { isMobile, isTablet } = useIsMobile();
  const { videos: categoryVideos, isLoading, totalCount } = useCategoryVideos(categoryId);
  const [currentPage, setCurrentPage] = useState(1);

  const categoryLabel = useMemo(() => {
    const category = allCategories.find(c => c.id === categoryId);
    return category?.label || categoryId;
  }, [allCategories, categoryId]);

  const cols = isMobile ? 2 : isTablet ? 3 : 4;
  const rows = 3;
  const perPage = cols * rows;
  const totalPages = Math.max(1, Math.ceil(categoryVideos.length / perPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const displayVideos = useMemo(() => {
    const start = (safeCurrentPage - 1) * perPage;
    return categoryVideos.slice(start, start + perPage);
  }, [categoryVideos, safeCurrentPage, perPage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (categoryVideos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No videos found in this category</p>
      </div>
    );
  }

  const gridCols = isMobile ? "grid-cols-2" : isTablet ? "grid-cols-3" : "grid-cols-4";

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex items-center gap-3">
        <h2
          className="text-2xl font-bold text-gray-800 dark:text-gray-100"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          {categoryLabel} Videos
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({totalCount} videos)
        </span>
      </div>

      {/* Video Grid - 3 rows */}
      <div className={`grid ${gridCols} gap-4`}>
        {displayVideos.map((video) => (
          <VideoCardWithOptions
            key={video.id}
            videoId={video.video_id}
            videoUuid={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            channelName={video.channel_name}
            channelThumbnail={video.channelThumbnail}
            views={video.views}
            formattedDate={getFormattedDate(video.uploaded_at)}
            duration={video.duration}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 mt-6">
          <CustomPaginationArrow
            direction="left"
            disabled={safeCurrentPage === 1}
            onClick={() => {
              setCurrentPage(p => Math.max(1, p - 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
            Page {safeCurrentPage} of {totalPages}
          </span>
          <CustomPaginationArrow
            direction="right"
            disabled={safeCurrentPage === totalPages}
            onClick={() => {
              setCurrentPage(p => Math.min(totalPages, p + 1));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </div>
  );
};
