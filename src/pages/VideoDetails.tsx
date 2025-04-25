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
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useIncrementVideoView } from "@/hooks/video/useIncrementVideoView";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const VideoDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, session } = useAuth();
  const incrementView = useIncrementVideoView();
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    console.log("VideoDetails page route:", location.pathname);
    console.log("VideoDetails page received videoId:", videoId);
    console.log("User authentication status:", isAuthenticated ? "logged in" : "logged out");
    if (isAuthenticated && session) {
      console.log("User session exists:", !!session);
    }
  }, [location.pathname, videoId, isAuthenticated, session]);

  if (!videoId) {
    toast.error("Video ID not provided");
    return <div className="p-4">Video ID not provided</div>;
  }

  const { 
    data: video, 
    isLoading: isLoadingVideo, 
    error,
    refetch
  } = useVideoQuery(videoId);
  
  const { data: channelVideos = [], isLoading: isLoadingRelated } = useRelatedVideosQuery(
    video?.channel_id || "", 
    videoId
  );

  const handleRetryLoad = async () => {
    setIsRetrying(true);
    try {
      await refetch();
    } catch (err) {
      console.error("Error retrying video load:", err);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    if (video && video.id) {
      const timer = setTimeout(() => {
        incrementView(video.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [video, incrementView]);

  if (isLoadingVideo || isRetrying) {
    return (
      <div className="container mx-auto p-4 mt-16">
        <BackButton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Skeleton className="w-full aspect-video rounded-md mb-4" />
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-1/2 h-6 mb-6" />
            <Skeleton className="w-full h-32" />
          </div>
          <div className="lg:col-span-1">
            <Skeleton className="w-full h-8 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-full h-24" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!video || error) {
    console.error("Video not found or error:", error, "for videoId:", videoId);
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
          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleRetryLoad}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              disabled={isRetrying}
            >
              {isRetrying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Try Again"
              )}
            </Button>
            <Link to="/videos" className="inline-block px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 transition-colors">
              Return to videos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  console.log("Video details found:", { 
    id: video.id,
    video_id: video.video_id,
    title: video.title,
    channelId: video.channel_id,
    views: video.views,
    authStatus: isAuthenticated ? "logged in" : "logged out"
  });

  console.log("Related videos:", channelVideos?.length || 0, "videos found");
  
  if (channelVideos?.length === 0 && !isLoadingRelated) {
    console.log("No related videos found, channel ID:", video.channel_id);
  }

  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      {isAuthenticated && <VideoHistory videoId={video.id} />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <VideoPlayer videoId={video.video_id} />
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-base md:text-2xl font-bold">{video.title}</h1>
            <ReportVideoDialog videoId={video.id} />
          </div>
          
          {isAuthenticated && <VideoInteractions videoId={video.id} />}
          
          {isAuthenticated && <VideoComments videoId={video.id} />}

          <div className="mt-8 border-t pt-8">
            <VideoInfo
              title={video.title}
              channelName={video.channel_name}
              channelId={video.channel_id}
              channelThumbnail={video.youtube_channels?.thumbnail_url}
              views={video.views}
              uploadedAt={video.uploaded_at}
              description={video.description}
            />
          </div>
        </div>
        
        <div className="lg:col-span-1">
          {isLoadingRelated ? (
            <div className="flex justify-center p-4">
              <LoadingAnimation size="small" color="muted" text="Loading related videos..." />
            </div>
          ) : (
            <RelatedVideos videos={channelVideos} />
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
