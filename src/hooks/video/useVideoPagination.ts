
import { useState, useEffect } from "react";
import { VideoData } from "@/hooks/video/useVideoFetcher";

interface UseVideoPaginationProps {
  videos: VideoData[];
  videosPerPage: number;
  isMobile?: boolean;
}

interface UseVideoPaginationResult {
  sortedVideos: VideoData[];
  displayVideos: VideoData[];
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  showMoreMobile: boolean;
  setShowMoreMobile: (value: boolean) => void;
}

export const useVideoPagination = ({
  videos,
  videosPerPage,
  isMobile = false
}: UseVideoPaginationProps): UseVideoPaginationResult => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  
  // Get ID of the first video before sorting (to potentially exclude from the grid)
  const firstVideoId = videos?.[0]?.id;
  
  // Sort videos by upload date and filter out the first video if it exists
  const sortedVideos = videos ? [...videos]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .filter(video => video.id !== firstVideoId) : [];

  const totalPages = Math.ceil(sortedVideos.length / videosPerPage);
  
  // Different pagination logic for mobile vs desktop
  const displayVideos = isMobile && !showMoreMobile
    ? sortedVideos.slice(0, videosPerPage)
    : sortedVideos.slice((currentPage - 1) * videosPerPage, currentPage * videosPerPage);

  // Reset to first page when videos array changes
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length]);

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
