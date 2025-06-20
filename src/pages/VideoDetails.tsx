
import React, { useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet";
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
import { VideoSEO } from "@/components/seo/VideoSEO";
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
  const viewIncrementedRef = useRef<string | null>(null);

  // Single effect for logging and view increment
  useEffect(() => {
    if (!videoId) return;
    
    console.log("VideoDetails page route:", location.pathname);
    console.log("VideoDetails page received videoId:", videoId);
    console.log("User authentication status:", isAuthenticated ? "logged in" : "logged out");
    
    // Only increment view once per video
    if (viewIncrementedRef.current !== videoId) {
      viewIncrementedRef.current = videoId;
      console.log("Incrementing view for video:", videoId);
      incrementView(videoId);
    }
  }, [videoId, location.pathname, isAuthenticated, incrementView]);

  if (!videoId) {
    toast.error("Video ID not provided");
    return <div className="p-4">Video ID not provided</div>;
  }

  const { data: video, isLoading: isLoadingVideo, error } = useVideoQuery(videoId);
  
  const { data: channelVideos = [], isLoading: isLoadingRelated } = useRelatedVideosQuery(
    video?.channel_id || "", 
    videoId
  );

  // Set page title based on video data
  const pageTitle = video?.title ? `${video.title} | YidVid` : "Loading Video | YidVid";

  if (isLoadingVideo) {
    return (
      <>
        <Helmet>
          <title>Loading Video | YidVid</title>
        </Helmet>
        <div className="container mx-auto p-4 mt-16 flex justify-center">
          <DelayedLoadingAnimation 
            size={isMobile ? "medium" : "large"} 
            color="primary" 
            text="Loading video..." 
            delayMs={3000}
          />
        </div>
      </>
    );
  }

  if (!video || error) {
    console.error("Video not found or error:", error, "for videoId:", videoId);
    return (
      <>
        <Helmet>
          <title>Video Not Found | YidVid</title>
        </Helmet>
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
      </>
    );
  }

  console.log("Video details found:", { 
    id: video.id,
    video_id: video.video_id,
    title: video.title,
    channelId: video.channel_id,
    views: video.views,
    authStatus: isAuthenticated ? "logged in" : "logged out",
    relatedVideosCount: channelVideos.length
  });

  // Convert the database video to VideoData format for SEO component
  const videoForSEO = {
    ...video,
    channel_name: video.channel_name || "Unknown Channel",
    channel_id: video.channel_id || "unknown-channel",
    uploaded_at: video.uploaded_at || new Date().toISOString(),
    updated_at: video.updated_at || new Date().toISOString(),
    created_at: video.created_at || new Date().toISOString(),
    views: video.views || 0
  };

  return (
    <>
      <VideoSEO video={videoForSEO} />
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
                <h1 className="text-xl md:text-2xl font-light text-black leading-tight">{video?.title}</h1>
                <ReportVideoDialog videoId={video?.id || ""} />
              </div>
              
              <VideoInteractions videoId={video?.id || ""} />
              
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
              <div>
                <h2 className="text-xl font-semibold mb-4 text-black">More from this channel</h2>
                <RelatedVideos 
                  videos={channelVideos} 
                  showHeading={false} 
                  isLoading={isLoadingRelated}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetails;
