import React from "react";
import { VideoCard } from "../VideoCard";

interface VideoGridProps {
  videos: {
    id: string;
    title: string;
    thumbnail: string;
    channelName: string;
    channelId: string;
    views: number;
    uploadedAt: string | Date;
  }[];
}

const VideoGrid: React.FC<VideoGridProps> = ({ videos }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <VideoCard
          key={video.id}
          id={video.id}
          title={video.title}
          thumbnail={video.thumbnail}
          channelName={video.channelName}
          channelId={video.channelId}
          views={video.views}
          uploadedAt={video.uploadedAt}
        />
      ))}
    </div>
  );
};

export default VideoGrid;
