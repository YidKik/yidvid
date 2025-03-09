
import { VideoCard } from "../VideoCard";

interface Video {
  id: string;
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
      <div className="h-[calc(3*240px)] overflow-y-auto pr-4 scrollbar-hide">
        <div className="space-y-4">
          {videos?.map((video) => (
            <VideoCard
              key={video.id}
              {...video}
              channelName={video.channel_name}
              uploadedAt={video.uploaded_at}
              thumbnail={video.thumbnail || "/lovable-uploads/2df6b540-f798-4831-8fcc-255a55486aa0.png"}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
