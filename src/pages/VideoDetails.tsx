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
import { RelatedVideosRow } from "@/components/video/details/RelatedVideosRow";
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
      
      <div className="min-h-screen bg-gradient-to-br from-muted/30 via-background to-muted/20">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <BackButton />
          
          {/* Desktop/Tablet Layout */}
          {!isMobile && (
            <>
              {/* Main content card with video and comments side by side */}
              <div className="mt-6 bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border/80 overflow-hidden">
                <div className="flex">
                  {/* Left: Channel Card + Video */}
                  <div className="flex-1 flex">
                    {/* Channel sidebar */}
                    <div className="w-64 flex-shrink-0 p-5 border-r border-border/50 bg-gradient-to-b from-primary/5 to-transparent">
                      <VideoChannelCard
                        channelName={video?.channel_name || ""}
                        channelId={video?.channel_id || ""}
                        channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                        channelDescription=""
                      />
                    </div>
                    
                    {/* Video section */}
                    <div className="flex-1 p-5">
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
                      
                      {/* Description */}
                      {video?.description && (
                        <div className="mt-4">
                          <VideoDescriptionCard description={video.description} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right: Comments section */}
                  <div className="w-80 flex-shrink-0 border-l border-border/50 bg-muted/10">
                    <div className="p-5 h-full max-h-[600px] overflow-y-auto">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Comments</h3>
                      {isAuthenticated ? (
                        <VideoComments videoId={video?.id || ""} />
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground text-sm">
                            Sign in to view and add comments
                          </p>
                          <Link 
                            to="/auth" 
                            className="inline-block mt-3 text-primary hover:text-primary/80 text-sm font-medium"
                          >
                            Sign In
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related Videos Row - Full width below */}
              <div className="mt-8">
                <RelatedVideosRow 
                  videos={channelVideos}
                  isLoading={isLoadingRelated}
                  channelName={video?.channel_name || ""}
                />
              </div>
            </>
          )}
          
          {/* Mobile Layout */}
          {isMobile && (
            <>
              {/* Video Card */}
              <div className="mt-6 bg-card/90 backdrop-blur-sm rounded-2xl shadow-lg border border-border/80 overflow-hidden">
                {/* Video Player */}
                <div className="rounded-t-2xl overflow-hidden">
                  <VideoPlayer videoId={video?.video_id || ""} />
                </div>
                
                <div className="p-4">
                  {/* Video Title */}
                  <h1 className="text-base font-semibold text-foreground leading-tight">
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
              </div>
              
              {/* Description */}
              {video?.description && (
                <div className="mt-6">
                  <VideoDescriptionCard description={video.description} />
                </div>
              )}
              
              {/* Comments */}
              {isAuthenticated && (
                <div className="mt-6 bg-card/90 backdrop-blur-sm rounded-2xl border border-border/80 p-4">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Comments</h3>
                  <VideoComments videoId={video?.id || ""} />
                </div>
              )}
              
              {/* Related Videos */}
              <div className="mt-6">
                <RelatedVideosRow 
                  videos={channelVideos}
                  isLoading={isLoadingRelated}
                  channelName={video?.channel_name || ""}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoDetails;
