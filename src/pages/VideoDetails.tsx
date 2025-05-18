import React, { useEffect } from 'react';
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
import { DelayedLoadingAnimation } from "@/components/ui/DelayedLoadingAnimation";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useIncrementVideoView } from "@/hooks/video/useIncrementVideoView";

const VideoDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const { isMobile } = useIsMobile();
  const { isAuthenticated, session } = useAuth();
  const incrementView = useIncrementVideoView();

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

  const { data: video, isLoading: isLoadingVideo, error } = useVideoQuery(videoId);
  
  const { data: channelVideos = [], isLoading: isLoadingRelated } = useRelatedVideosQuery(
    video?.channel_id || "", 
    videoId
  );

  // Increment view count only once after we have the video data
  useEffect(() => {
    if (videoId && video?.id) {
      const idToIncrement = video?.id || videoId;
      console.log("Incrementing view for video:", idToIncrement);
      incrementView(idToIncrement);
    }
  }, [video?.id, videoId, incrementView]);

  if (isLoadingVideo) {
    return (
      <div className="container mx-auto p-4 mt-16 flex justify-center">
        <DelayedLoadingAnimation 
          size={isMobile ? "medium" : "large"} 
          color="primary" 
          text="Loading video..." 
          delayMs={3000}
        />
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
          <Link to="/videos" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors">
            Return to videos
          </Link>
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
    <div className="w-full min-h-screen bg-white text-black">
      <div className="container mx-auto p-4 pt-16">
        <BackButton />
        {isAuthenticated && <VideoHistory videoId={video?.id || ""} />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative">
              <VideoPlayer videoId={video?.video_id || ""} />
            </div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-base md:text-2xl font-bold text-black">{video?.title}</h1>
              <ReportVideoDialog videoId={video?.id || ""} />
            </div>
            
            {isAuthenticated && <VideoInteractions videoId={video?.id || ""} />}
            
            {isAuthenticated && <VideoComments videoId={video?.id || ""} />}

            <div className="mt-8 border-t pt-8">
              <VideoInfo
                title={video?.title || ""}
                channelName={video?.channel_name || ""}
                channelId={video?.channel_id || ""}
                channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                views={video?.views || 0}
                uploadedAt={video?.uploaded_at || ""}
                description={video?.description || ""}
              />
            </div>
          </div>
          
          <div className="lg:col-span-1">
            {isLoadingRelated ? (
              <div className="flex justify-center p-4">
                <DelayedLoadingAnimation 
                  size="small" 
                  color="muted" 
                  text="Loading related videos..." 
                  delayMs={3000}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">More videos</h2>
                <RelatedVideos videos={channelVideos} showHeading={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoDetails;
