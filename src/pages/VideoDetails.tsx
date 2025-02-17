
import { useParams } from "react-router-dom";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { VideoInfo } from "@/components/video/VideoInfo";
import { RelatedVideos } from "@/components/video/RelatedVideos";
import { BackButton } from "@/components/navigation/BackButton";
import { VideoInteractions } from "@/components/video/VideoInteractions";
import { ReportVideoDialog } from "@/components/video/ReportVideoDialog";
import { useVideoQuery } from "@/components/video/details/VideoQuery";
import { VideoComments } from "@/components/video/details/VideoComments";
import { useRelatedVideosQuery } from "@/components/video/details/RelatedVideosQuery";
import { VideoHistory } from "@/components/video/details/VideoHistory";

const VideoDetails = () => {
  const { id } = useParams<{ id: string }>();
  if (!id) return <div className="p-4">Video ID not provided</div>;

  const { data: video, isLoading: isLoadingVideo } = useVideoQuery(id);
  const { data: channelVideos } = useRelatedVideosQuery(video?.channel_id ?? "", video?.id ?? "");

  if (isLoadingVideo) {
    return <div className="p-4">Loading...</div>;
  }

  if (!video) {
    return <div className="p-4">Video not found</div>;
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <VideoHistory videoId={video.id} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={video.video_id} />
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-base md:text-2xl font-bold">{video.title}</h1>
            <ReportVideoDialog videoId={video.id} />
          </div>
          
          <VideoInteractions videoId={video.id} />
          
          <VideoComments videoId={video.id} />

          <div className="mt-8 border-t pt-8">
            <VideoInfo
              title={video.title}
              channelName={video.channel_name}
              channelThumbnail={video.youtube_channels?.thumbnail_url}
              views={video.views}
              uploadedAt={video.uploaded_at}
              description={video.description}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <RelatedVideos videos={channelVideos} />
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
