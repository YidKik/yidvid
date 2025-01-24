import React from "react";
import { VideoCard } from "./VideoCard";

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
}

export default function VideoGrid({ videos = [], maxVideos, rowSize }: VideoGridProps) {
  const displayVideos = maxVideos ? videos.slice(0, maxVideos) : videos;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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