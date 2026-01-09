import React, { useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from "react-router-dom";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { BackButton } from "@/components/navigation/BackButton";
import { useVideoQuery } from "@/components/video/details/VideoQuery";
import { VideoComments } from "@/components/video/details/VideoComments";
import { useRelatedVideosQuery } from "@/components/video/details/RelatedVideosQuery";
import { VideoHistory } from "@/components/video/details/VideoHistory";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { VideoSEO } from "@/components/seo/VideoSEO";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { useIncrementVideoView } from "@/hooks/video/useIncrementVideoView";
import { VideoActionBar } from "@/components/video/details/VideoActionBar";
import { VideoChannelCard } from "@/components/video/details/VideoChannelCard";
import { VideoMetaInfo } from "@/components/video/details/VideoMetaInfo";
import { RelatedVideosSidebar } from "@/components/video/details/RelatedVideosSidebar";
import { VideoDescriptionCard } from "@/components/video/details/VideoDescriptionCard";

const VideoDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const { isMobile, isTablet } = useIsMobile();
  const { isAuthenticated, session } = useAuth();
  const incrementView = useIncrementVideoView();
  const viewIncrementedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!videoId) return;
    
    console.log("VideoDetails page route:", location.pathname);
    console.log("VideoDetails page received videoId:", videoId);
    
    if (viewIncrementedRef.current !== videoId) {
      viewIncrementedRef.current = videoId;
      incrementView(videoId);
    }
  }, [videoId, location.pathname, incrementView]);

  if (!videoId) {
    toast.error("Video ID not provided");
    return <div className="p-4">Video ID not provided</div>;
  }

  const { data: video, isLoading: isLoadingVideo, error } = useVideoQuery(videoId);
  
  const { data: channelVideos = [], isLoading: isLoadingRelated } = useRelatedVideosQuery(
    video?.channel_id || "",
    videoId
  );

  if (!video || error) {
    if (!isLoadingVideo) {
      console.error("Video not found or error:", error, "for videoId:", videoId);
    }
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-4 pt-20">
          <BackButton />
          <div className="p-8 text-center">
            <div className="mx-auto mb-6 w-full max-w-md aspect-video flex items-center justify-center">
              <VideoPlaceholder size="large" />
            </div>
            <h2 className="text-xl font-semibold text-destructive">
              {isLoadingVideo ? "Loading..." : "Video not found"}
            </h2>
            {!isLoadingVideo && (
              <>
                <p className="mt-2 text-muted-foreground">
                  {error ? `Error: ${error.message}` : "The video you're looking for doesn't exist or has been removed."}
                </p>
                <Link to="/videos" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Return to videos
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const videoForSEO = {
    ...video,
    channel_name: video.channel_name || "Unknown Channel",
    channel_id: video.channel_id || "unknown-channel",
    uploaded_at: video.uploaded_at || new Date().toISOString(),
    updated_at: video.updated_at || new Date().toISOString(),
    created_at: video.created_at || new Date().toISOString(),
    views: video.views || 0,
    category: (video.category as "music" | "torah" | "inspiration" | "podcast" | "education" | "entertainment" | "other" | "custom" | null) || null
  };

  return (
    <>
      <VideoSEO video={videoForSEO} />
      {isAuthenticated && <VideoHistory videoId={video?.id || ""} />}
      
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <BackButton />
          
          {/* Main content wrapper - card style like reference */}
          <div className="mt-6 bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
            
            {/* Desktop/Tablet: Side by side layout */}
            {!isMobile && (
              <div className="flex">
                {/* Left: Channel Card */}
                <div className="w-80 flex-shrink-0 p-6 border-r border-border bg-muted/20">
                  <VideoChannelCard
                    channelName={video?.channel_name || ""}
                    channelId={video?.channel_id || ""}
                    channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                    channelDescription=""
                  />
                </div>
                
                {/* Right: Video Player and Info */}
                <div className="flex-1 p-6">
                  {/* Video Player */}
                  <div className="rounded-xl overflow-hidden shadow-md">
                    <VideoPlayer videoId={video?.video_id || ""} />
                  </div>
                  
                  {/* Video Title and Actions Row */}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h1 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                        {video?.title}
                      </h1>
                      <VideoMetaInfo 
                        views={video?.views || 0} 
                        uploadedAt={video?.uploaded_at || ""} 
                      />
                    </div>
                    
                    {/* Action buttons */}
                    <VideoActionBar 
                      videoId={video?.id || ""} 
                      youtubeVideoId={video?.video_id || ""}
                    />
                  </div>
                </div>
              </div>
            )}
            
            {/* Mobile: Stacked layout */}
            {isMobile && (
              <div className="p-4">
                {/* Video Player */}
                <div className="rounded-xl overflow-hidden shadow-md -mx-4 -mt-4">
                  <VideoPlayer videoId={video?.video_id || ""} />
                </div>
                
                {/* Video Title */}
                <h1 className="mt-4 text-base font-semibold text-foreground leading-tight">
                  {video?.title}
                </h1>
                
                {/* Meta and Actions Row */}
                <div className="mt-3 flex items-center justify-between">
                  <VideoMetaInfo 
                    views={video?.views || 0} 
                    uploadedAt={video?.uploaded_at || ""} 
                  />
                  <VideoActionBar 
                    videoId={video?.id || ""} 
                    youtubeVideoId={video?.video_id || ""}
                    compact
                  />
                </div>
                
                {/* Channel Card */}
                <div className="mt-4 pt-4 border-t border-border/30">
                  <VideoChannelCard
                    channelName={video?.channel_name || ""}
                    channelId={video?.channel_id || ""}
                    channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                    channelDescription=""
                    compact
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Below main card: Description, Comments, Related Videos */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column: Description and Comments */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description Card */}
              {video?.description && (
                <VideoDescriptionCard description={video.description} />
              )}
              
              {/* Comments Section */}
              {isAuthenticated && (
                <VideoComments videoId={video?.id || ""} />
              )}
            </div>
            
            {/* Right column: Related Videos */}
            <div className="lg:col-span-1">
              <RelatedVideosSidebar 
                videos={channelVideos}
                isLoading={isLoadingRelated}
                channelName={video?.channel_name || ""}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoDetails;
