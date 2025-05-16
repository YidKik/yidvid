
import { useState, useMemo, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";

interface UseVideoPaginationProps {
  videos: VideoData[];
  videosPerPage: number;
  isMobile?: boolean;
  preloadNext?: boolean;
  progressiveLoading?: {
    firstPageLoaded: boolean;
    remainingPagesLoading: boolean;
  };
}

export const useVideoPagination = ({
  videos,
  videosPerPage,
  isMobile = false,
  preloadNext = false,
  progressiveLoading
}: UseVideoPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [nextPagePreloaded, setNextPagePreloaded] = useState(false);

  // Sort videos by uploadedAt in descending order
  const sortedVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    
    return [...videos].sort((a, b) => {
      // Convert to Date objects to ensure proper comparison
      const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      
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
    const endIdx = startIdx + videosPerPage;
      
    return sortedVideos.slice(startIdx, endIdx);
  }, [sortedVideos, currentPage, videosPerPage, isMobile, showMoreMobile]);

  // Preload next page data when current page is loaded
  useEffect(() => {
    if (preloadNext && !nextPagePreloaded && currentPage < totalPages) {
      const preloadNextPage = () => {
        const nextPageIdx = currentPage;
        const startIdx = nextPageIdx * videosPerPage;
        const endIdx = startIdx + videosPerPage;
        
        // Just access the next page data to ensure it's in memory
        const nextPageData = sortedVideos.slice(startIdx, endIdx);
        console.log(`Preloaded page ${nextPageIdx + 1} with ${nextPageData.length} videos`);
        setNextPagePreloaded(true);
      };
      
      // Add small delay to prioritize current page rendering
      const timer = setTimeout(preloadNextPage, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages, videosPerPage, sortedVideos, preloadNext, nextPagePreloaded]);

  // Reset preloaded state when page changes
  useEffect(() => {
    setNextPagePreloaded(false);
  }, [currentPage]);

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
