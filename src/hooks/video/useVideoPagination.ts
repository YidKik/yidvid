
import { useState, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";

interface VideoPaginationProps {
  videos: VideoData[];
  videosPerPage: number;
  isMobile?: boolean;
}

export const useVideoPagination = ({
  videos,
  videosPerPage,
  isMobile = false
}: VideoPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  
  // Sort videos by upload date, most recent first
  const sortedVideos = [...(videos || [])].sort((a, b) => {
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });
  
  // Calculate total pages based on number of videos and videos per page
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / videosPerPage));
  
  // Get the videos to display on the current page
  const displayVideos = sortedVideos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );
  
  // Reset to first page when videos array changes or its length changes
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length]);
  
  // Ensure current page is valid when totalPages changes
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);
  
  // If on mobile and the "show more" button hasn't been clicked,
  // only show a limited number of videos (e.g., 4)
  const mobileDisplayVideos = isMobile && !showMoreMobile
    ? sortedVideos.slice(0, 4)
    : displayVideos;
  
  // Handle page change with validation
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  
  return {
    sortedVideos,
    displayVideos: isMobile ? mobileDisplayVideos : displayVideos,
    currentPage,
    totalPages,
    setCurrentPage: handlePageChange,
    showMoreMobile,
    setShowMoreMobile
  };
};
