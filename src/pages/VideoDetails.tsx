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
import { FriendlyVideoActionBar } from "@/components/video/details/FriendlyVideoActionBar";
import { FriendlyChannelSection } from "@/components/video/details/FriendlyChannelSection";
import { MessageCircle, Sparkles } from "lucide-react";

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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
        <div className="container mx-auto p-4 pt-20">
          <BackButton />
          <div className="p-8 text-center bg-card/80 backdrop-blur-sm rounded-3xl shadow-lg border border-border/50 mt-6">
            <div className="mx-auto mb-6 w-full max-w-md aspect-video flex items-center justify-center bg-muted/30 rounded-2xl">
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
                <Link to="/videos" className="mt-4 inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/25">
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
      
      <div className="min-h-screen bg-gradient-to-br from-yellow-50/40 via-background to-red-50/20">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <BackButton />
          
          {/* Desktop/Tablet Layout */}
          {!isMobile && (
            <div className="mt-6 space-y-8">
              {/* Main content area - Video left, Comments right */}
              <div className="flex gap-6">
                {/* Left Column - Video and Info */}
                <div className="flex-1 space-y-6">
                  {/* Video Player Card - Enhanced fade background */}
                  <div className="relative rounded-3xl shadow-2xl overflow-hidden border-2 border-yellow-200/30">
                    {/* Enhanced fade transparency background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-card/70 via-card/50 to-card/40 backdrop-blur-md" />
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-red-100/15 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-yellow-50/10 via-transparent to-red-50/10 pointer-events-none" />
                    
                    {/* Video Player */}
                    <div className="relative aspect-video">
                      <VideoPlayer videoId={video?.video_id || ""} />
                    </div>
                    
                    {/* Yellow/Red gradient divider */}
                    <div className="h-1 bg-gradient-to-r from-yellow-300/40 via-red-300/30 to-yellow-300/40" />
                    
                    {/* Video Title Section */}
                    <div className="relative p-6">
                      <h1 className="text-xl font-bold text-foreground leading-tight mb-4">
                        {video?.title}
                      </h1>
                      
                      {/* Action Buttons */}
                      <FriendlyVideoActionBar 
                        videoId={video?.id || ""} 
                        youtubeVideoId={video?.video_id || ""}
                        views={video?.views || 0}
                        uploadedAt={video?.uploaded_at || ""}
                      />
                    </div>
                  </div>
                  
                  {/* Section Divider */}
                  <div className="flex items-center gap-4 px-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200/40 to-yellow-200/30" />
                    <div className="w-2 h-2 rounded-full bg-gradient-to-br from-red-400/50 to-yellow-400/40" />
                    <div className="flex-1 h-px bg-gradient-to-r from-yellow-200/30 via-red-200/40 to-transparent" />
                  </div>
                  
                  {/* Channel, Description & More Videos Section - Combined */}
                  <FriendlyChannelSection
                    channelName={video?.channel_name || ""}
                    channelId={video?.channel_id || ""}
                    channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                    description={video?.description || ""}
                    channelVideos={channelVideos}
                    isLoadingVideos={isLoadingRelated}
                  />
                </div>
                
                {/* Right Column - Comments (wider) */}
                <div className="w-[420px] flex-shrink-0">
                  <div className="relative bg-card/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden sticky top-24 border-2 border-yellow-200/40">
                    {/* Friendly gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/20 via-transparent to-red-50/10 pointer-events-none" />
                    
                    {/* Comments Header */}
                    <div className="relative p-5 bg-gradient-to-r from-yellow-100/50 via-red-50/30 to-yellow-50/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-400/30 rounded-2xl">
                          <MessageCircle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">💬 Comments</h3>
                      </div>
                    </div>
                    
                    {/* Yellow divider */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent" />
                    
                    {/* Comments Content */}
                    <div className="relative p-5 max-h-[600px] overflow-y-auto">
                      {isAuthenticated ? (
                        <VideoComments videoId={video?.id || ""} />
                      ) : (
                        <div className="text-center py-10">
                          <div className="w-14 h-14 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-7 w-7 text-yellow-500" />
                          </div>
                          <p className="text-foreground font-medium text-sm mb-4 px-4 leading-relaxed">
                            To view comments and post comments, you need to be logged in.
                          </p>
                          <Link 
                            to="/auth" 
                            className="inline-block px-6 py-2.5 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold hover:bg-yellow-500 transition-all hover:shadow-lg hover:shadow-yellow-300/40"
                          >
                            Sign In
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Related videos are now part of FriendlyChannelSection */}
            </div>
          )}
          
          {/* Mobile Layout */}
          {isMobile && (
            <div className="mt-4 space-y-5">
              {/* Video Card - Enhanced fade background */}
              <div className="relative rounded-3xl shadow-2xl overflow-hidden border-2 border-yellow-200/30">
                {/* Enhanced fade transparency background */}
                <div className="absolute inset-0 bg-gradient-to-b from-card/70 via-card/50 to-card/40 backdrop-blur-md" />
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-100/20 via-transparent to-red-100/15 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-50/10 via-transparent to-red-50/10 pointer-events-none" />
                
                {/* Video Player */}
                <VideoPlayer videoId={video?.video_id || ""} />
                
                {/* Yellow/Red gradient divider */}
                <div className="h-1 bg-gradient-to-r from-yellow-300/40 via-red-300/30 to-yellow-300/40" />
                
                <div className="relative p-5">
                  {/* Video Title */}
                  <h1 className="text-lg font-bold text-foreground leading-tight mb-4">
                    {video?.title}
                  </h1>
                  
                  {/* Action Buttons */}
                  <FriendlyVideoActionBar 
                    videoId={video?.id || ""} 
                    youtubeVideoId={video?.video_id || ""}
                    views={video?.views || 0}
                    uploadedAt={video?.uploaded_at || ""}
                    compact
                  />
                </div>
              </div>
              
              {/* Mobile Section Divider */}
              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-200/40 to-yellow-200/30" />
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-red-400/50 to-yellow-400/40" />
                <div className="flex-1 h-px bg-gradient-to-r from-yellow-200/30 via-red-200/40 to-transparent" />
              </div>
              
              {/* Channel, Description & More Videos Section - Combined */}
              <FriendlyChannelSection
                channelName={video?.channel_name || ""}
                channelId={video?.channel_id || ""}
                channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                description={video?.description || ""}
                channelVideos={channelVideos}
                isLoadingVideos={isLoadingRelated}
                compact
              />
              
              {/* Comments - Mobile */}
              <div className="relative bg-card/90 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border-2 border-yellow-200/40">
                {/* Friendly gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/20 via-transparent to-red-50/10 pointer-events-none" />
                
                <div className="relative p-4 bg-gradient-to-r from-yellow-100/50 via-red-50/30 to-yellow-50/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-400/30 rounded-xl">
                      <MessageCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">💬 Comments</h3>
                  </div>
                </div>
                
                {/* Yellow divider */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-yellow-300/50 to-transparent" />
                
                <div className="relative p-4">
                  {isAuthenticated ? (
                    <VideoComments videoId={video?.id || ""} />
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
                        <MessageCircle className="h-6 w-6 text-yellow-500" />
                      </div>
                      <p className="text-foreground font-medium text-sm mb-3 px-2 leading-relaxed">
                        To view comments and post comments, you need to be logged in.
                      </p>
                      <Link 
                        to="/auth" 
                        className="inline-block px-5 py-2 bg-yellow-400 text-yellow-900 rounded-full text-sm font-semibold hover:bg-yellow-500 transition-all"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Related videos are now part of FriendlyChannelSection */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoDetails;
