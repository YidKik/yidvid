
import { useState, useMemo } from "react";
import { VideoData } from "./types/video-fetcher";

interface UseVideoPaginationProps {
  videos: VideoData[];
  videosPerPage: number;
  isMobile?: boolean;
  preloadNext?: boolean;
}

export const useVideoPagination = ({
  videos,
  videosPerPage,
  isMobile = false,
  preloadNext = false,
}: UseVideoPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMobile, setShowMoreMobile] = useState(false);

  // Sort videos by uploaded_at in descending order
  const sortedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    
    return [...videos].sort((a, b) => {
      // Convert to Date objects to ensure proper comparison
      const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
      const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
      
      // Sort in descending order (newest first)
      return dateB - dateA;
    });
  }, [videos]);

  // Ensure we have at least 15 pages by adjusting videos per page if needed
  const adjustedVideosPerPage = useMemo(() => {
    if (sortedVideos.length === 0) return videosPerPage;
    
    const minPages = 15;
    const naturalPages = Math.ceil(sortedVideos.length / videosPerPage);
    
    if (naturalPages < minPages) {
      // Calculate videos per page to get exactly 15 pages (or close to it)
      const adjustedPerPage = Math.max(1, Math.floor(sortedVideos.length / minPages));
      return adjustedPerPage;
    }
    
    return videosPerPage;
  }, [sortedVideos.length, videosPerPage]);

  const totalPages = Math.ceil(sortedVideos.length / adjustedVideosPerPage);

  // Get videos for current page
  const displayVideos = useMemo(() => {
    if (isMobile && showMoreMobile) {
      return sortedVideos; // Show all videos on mobile when "show more" is clicked
    }

    const startIdx = (currentPage - 1) * adjustedVideosPerPage;
    const endIdx = startIdx + adjustedVideosPerPage;
      
    return sortedVideos.slice(startIdx, endIdx);
  }, [sortedVideos, currentPage, adjustedVideosPerPage, isMobile, showMoreMobile, preloadNext]);

  return {
    sortedVideos,
    displayVideos,
    currentPage,
    totalPages,
    setCurrentPage,
    showMoreMobile,
    setShowMoreMobile
  };
};
