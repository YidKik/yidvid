
import { useState, useEffect } from "react";
import { VideoData } from "./types/video-fetcher";

interface VideoPaginationProps {
  videos: VideoData[];
  videosPerPage: number;
  isMobile?: boolean;
  preloadNext?: boolean;
}

export const useVideoPagination = ({
  videos,
  videosPerPage,
  isMobile = false,
  preloadNext = true
}: VideoPaginationProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMoreMobile, setShowMoreMobile] = useState(false);
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false);
  
  // Ensure we're working with unique videos by ID and video_id
  const getUniqueVideos = (videoArr: VideoData[]) => {
    // Create a Map using composite key of id + video_id for uniqueness
    const uniqueMap = new Map();
    
    videoArr.forEach(video => {
      const key = `${video.id}-${video.video_id}`;
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, video);
      }
    });
    
    return Array.from(uniqueMap.values());
  };
  
  // Sort videos by upload date, most recent first
  // Ensure each video has a unique ID for proper rendering
  const sortedVideos = getUniqueVideos([...(videos || [])].sort((a, b) => {
    try {
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    } catch (err) {
      console.error("Error sorting videos by date:", err);
      return 0; // Keep original order if there's an error
    }
  }));
  
  // Calculate total pages based on number of videos and videos per page
  const totalPages = Math.max(1, Math.ceil(sortedVideos.length / videosPerPage));
  
  // Get the videos to display on the current page
  const displayVideos = sortedVideos.slice(
    (currentPage - 1) * videosPerPage,
    currentPage * videosPerPage
  );
  
  // Preload next page videos to improve perceived performance
  useEffect(() => {
    if (preloadNext && currentPage < totalPages) {
      setIsLoadingNextPage(true);
      
      // Use a timeout to allow the current page to render first
      const timeoutId = setTimeout(() => {
        // This just triggers fetching the next page's thumbnails
        // by creating Image objects that the browser will download
        const nextPageVideos = sortedVideos.slice(
          currentPage * videosPerPage,
          (currentPage + 1) * videosPerPage
        );
        
        nextPageVideos.forEach(video => {
          if (video.thumbnail) {
            const img = new Image();
            img.src = video.thumbnail;
          }
        });
        
        setIsLoadingNextPage(false);
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentPage, preloadNext, sortedVideos, totalPages, videosPerPage]);
  
  // Reset to first page when videos array changes or its length changes or videosPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [videos?.length, videosPerPage]);
  
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
      // Scroll to top of grid when changing pages
      setTimeout(() => {
        try {
          const gridElement = document.querySelector('.video-grid');
          if (gridElement) {
            const headerHeight = 100; // Approximate header height
            const rect = gridElement.getBoundingClientRect();
            window.scrollTo({
              top: window.scrollY + rect.top - headerHeight,
              behavior: 'smooth'
            });
          }
        } catch (err) {
          console.error("Error scrolling to grid:", err);
        }
      }, 50);
    }
  };
  
  return {
    sortedVideos,
    displayVideos: isMobile ? mobileDisplayVideos : displayVideos,
    currentPage,
    totalPages,
    setCurrentPage: handlePageChange,
    showMoreMobile,
    setShowMoreMobile,
    isLoadingNextPage
  };
};
