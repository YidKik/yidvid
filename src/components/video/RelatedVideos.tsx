import { VideoCard } from "../VideoCard";

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  views: number;
  uploaded_at: string;
}

interface RelatedVideosProps {
  videos?: Video[];
}

export const RelatedVideos = ({ videos }: RelatedVideosProps) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">More videos</h2>
      <div className="space-y-4">
        {videos?.map((video) => (
          <VideoCard
            key={video.id}
            {...video}
            channelName={video.channel_name}
            uploadedAt={new Date(video.uploaded_at)}
          />
        ))}
      </div>
    </div>
  );
};