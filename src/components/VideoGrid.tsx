import React from "react";
import { VideoCard } from "./VideoCard";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoGridProps {
  videos?: {
    id: string;
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
  const displayVideos = maxVideos ? videos.slice(0, maxVideos) : videos;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {displayVideos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channelName={video.channelName}
          views={video.views}
          uploadedAt={video.uploadedAt}
        />
      ))}
    </div>
  );
}