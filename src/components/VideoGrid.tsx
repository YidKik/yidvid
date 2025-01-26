import React, { useState } from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface VideoGridProps {
  videos?: {
    id: string;  // This is the UUID from the database
    video_id: string;  // This is the YouTube video ID
    title: string;
    thumbnail: string;
    channelName: string;
    channelId: string;
    views: number;
    uploadedAt: string | Date;
  }[];
  maxVideos?: number;
  rowSize?: number;
  isLoading?: boolean;
}

export default function VideoGrid({ videos = [], maxVideos = 12, rowSize = 4, isLoading }: VideoGridProps) {
  const [showAll, setShowAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = rowSize * 3;

  // Get unique channel videos for the first page only if not showing all
  const firstPageVideos = videos.reduce((acc, current) => {
    const existingVideo = acc.find(video => video.channelId === current.channelId);
    if (!existingVideo) {
      acc.push(current);
    } else {
      const existingDate = new Date(existingVideo.uploadedAt);
      const currentDate = new Date(current.uploadedAt);
      if (currentDate > existingDate) {
        const index = acc.findIndex(video => video.channelId === current.channelId);
        acc[index] = current;
      }
    }
    return acc;
  }, [] as VideoGridProps['videos']);

  const totalPages = Math.ceil((showAll ? videos.length : firstPageVideos.length) / videosPerPage);
  const indexOfLastVideo = currentPage * videosPerPage;
  const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
  
  const currentVideos = !showAll
    ? firstPageVideos.slice(0, maxVideos)
    : videos.slice(indexOfFirstVideo, indexOfLastVideo);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 max-w-[1600px] mx-auto">
        {Array.from({ length: maxVideos || 12 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton className="aspect-video w-full" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 max-w-[1600px] mx-auto">
        {currentVideos.map((video) => (
          <VideoCard
            key={video.id}
            id={video.video_id}
            uuid={video.id}
            title={video.title}
            thumbnail={video.thumbnail}
            channelName={video.channelName}
            views={video.views}
            uploadedAt={video.uploadedAt}
          />
        ))}
      </div>
      
      <div className="flex flex-col items-center gap-4 mt-8">
        {!showAll && videos.length > maxVideos && (
          <Button 
            onClick={() => {
              setShowAll(true);
              setCurrentPage(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            variant="outline"
            className="w-40"
          >
            See More
          </Button>
        )}
        
        {showAll && totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4">
                  Page {currentPage} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>
    </div>
  );
}