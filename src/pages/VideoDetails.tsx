
import { useParams, Link, useLocation } from "react-router-dom";
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
import { LoadingAnimation } from "@/components/ui/LoadingAnimation";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { toast } from "sonner";

const VideoDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();

  if (!videoId) {
    toast.error("Video ID not provided");
    return <div className="p-4">Video ID not provided</div>;
  }

  // Pass the videoId directly to the query hooks
  const { data: video, isLoading: isLoadingVideo, error } = useVideoQuery(videoId);
  const { data: channelVideos } = useRelatedVideosQuery(video?.channel_id ?? "", video?.id ?? "");

  if (isLoadingVideo) {
    return (
      <div className="container mx-auto p-4 mt-16 flex justify-center">
        <LoadingAnimation size="medium" color="primary" text="Loading video..." />
      </div>
    );
  }

  if (!video || error) {
    console.error("Video not found or error:", error);
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="p-8 text-center">
          <div className="mx-auto mb-6 w-full max-w-md aspect-video flex items-center justify-center">
            <VideoPlaceholder size="large" />
          </div>
          <h2 className="text-xl font-semibold text-destructive">Video not found</h2>
          <p className="mt-2 text-muted-foreground">
            {error ? `Error: ${error.message}` : "The video you're looking for doesn't exist or has been removed."}
          </p>
          <Link to="/videos" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
            Return to videos
          </Link>
        </div>
      </div>
    );
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
}

export default VideoDetails;
