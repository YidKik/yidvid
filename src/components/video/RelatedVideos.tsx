
import { VideoCard } from "../VideoCard";

interface Video {
  id: string;
  video_id: string; // Add this field to ensure we have YouTube video ID
  title: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number;
  uploaded_at: string | Date;
}

interface RelatedVideosProps {
  videos?: Video[];
}

export const RelatedVideos = ({ videos }: RelatedVideosProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">More videos</h2>
      {videos && videos.length > 0 ? (
        <div className="h-[calc(3*240px)] overflow-y-auto pr-4 scrollbar-hide">
          <div className="space-y-4">
            {videos.map((video) => (
              <VideoCard
                key={video.id}
                id={video.id}
                video_id={video.video_id}
                title={video.title}
                thumbnail={video.thumbnail || "/placeholder.svg"}
                channelName={video.channel_name}
                channelId={video.channel_id}
                views={video.views}
                uploadedAt={video.uploaded_at}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-4 text-muted-foreground">
          No related videos found
        </div>
      )}
    </div>
  );
};
