
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

  // Sort videos by updatedAt in descending order
  const sortedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    
    return [...videos].sort((a, b) => {
      // Convert to Date objects to ensure proper comparison
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      
      // Sort in descending order (newest first)
      return dateB - dateA;
    });
  }, [videos]);

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);

  // Get videos for current page
  const displayVideos = useMemo(() => {
    if (isMobile && showMoreMobile) {
      return sortedVideos; // Show all videos on mobile when "show more" is clicked
    }

    const startIdx = (currentPage - 1) * videosPerPage;
    const endIdx = preloadNext 
      ? startIdx + videosPerPage * 2 // Preload next page if enabled
      : startIdx + videosPerPage;
      
    return sortedVideos.slice(startIdx, endIdx);
  }, [sortedVideos, currentPage, videosPerPage, isMobile, showMoreMobile, preloadNext]);

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
