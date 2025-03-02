
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
  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  
  // Get the videos to display on the current page
  const displayVideos = sortedVideos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );
  
  // Reset to first page when videos change
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length]);
  
  // If on mobile and the "show more" button hasn't been clicked,
  // only show a limited number of videos (e.g., 4)
  const mobileDisplayVideos = isMobile && !showMoreMobile
    ? sortedVideos.slice(0, 4)
    : displayVideos;
  
  return {
    sortedVideos,
    displayVideos: isMobile ? mobileDisplayVideos : displayVideos,
    currentPage,
    totalPages,
    setCurrentPage,
    showMoreMobile,
    setShowMoreMobile
  };
};
