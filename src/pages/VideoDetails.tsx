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
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-background to-rose-50/20">
        <div className="container mx-auto px-4 pt-20 pb-12">
          <BackButton />
          
          {/* Desktop/Tablet Layout */}
          {!isMobile && (
            <div className="mt-6 space-y-8">
              {/* Main content area - Video left, Comments right */}
              <div className="flex gap-6">
                {/* Left Column - Video and Info */}
                <div className="flex-1 space-y-6">
                  {/* Video Player Card - Fade transparency background */}
                  <div className="relative rounded-3xl shadow-2xl overflow-hidden border border-red-200/20">
                    {/* Fade transparency background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/40 to-card/30 backdrop-blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-br from-red-50/10 via-transparent to-yellow-50/10 pointer-events-none" />
                    
                    {/* Video Player */}
                    <div className="relative aspect-video">
                      <VideoPlayer videoId={video?.video_id || ""} />
                    </div>
                    
                    {/* Subtle gradient divider */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-red-300/30 to-yellow-300/20" />
                    
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
                
                {/* Right Column - Comments */}
                <div className="w-96 flex-shrink-0">
                  <div className="relative bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden sticky top-24 border border-rose-200/30">
                    {/* Warm gradient glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 via-transparent to-amber-50/15 pointer-events-none" />
                    
                    {/* Comments Header */}
                    <div className="relative p-5 bg-gradient-to-r from-amber-100/40 via-rose-100/30 to-amber-50/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-amber-400/30 to-rose-400/20 rounded-2xl">
                          <MessageCircle className="h-5 w-5 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Comments</h3>
                      </div>
                    </div>
                    
                    {/* Friendly divider */}
                    <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                    
                    {/* Comments Content */}
                    <div className="relative p-5 max-h-[600px] overflow-y-auto">
                      {isAuthenticated ? (
                        <VideoComments videoId={video?.id || ""} />
                      ) : (
                        <div className="text-center py-12">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-amber-500" />
                          </div>
                          <p className="text-muted-foreground text-sm mb-4">
                            Join the conversation!
                          </p>
                          <Link 
                            to="/auth" 
                            className="inline-block px-6 py-2.5 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full text-sm font-medium hover:from-amber-500 hover:to-rose-500 transition-all hover:shadow-lg hover:shadow-amber-300/30"
                          >
                            Sign In to Comment
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
              {/* Video Card - Fade transparency background */}
              <div className="relative rounded-3xl shadow-2xl overflow-hidden border border-red-200/20">
                {/* Fade transparency background */}
                <div className="absolute inset-0 bg-gradient-to-b from-card/60 via-card/40 to-card/30 backdrop-blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-red-50/10 via-transparent to-yellow-50/10 pointer-events-none" />
                
                {/* Video Player */}
                <VideoPlayer videoId={video?.video_id || ""} />
                
                {/* Subtle divider */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-red-300/30 to-yellow-300/20" />
                
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
              
              {/* Comments */}
              <div className="relative bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-rose-200/30">
                {/* Warm gradient glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-rose-50/20 via-transparent to-amber-50/15 pointer-events-none" />
                
                <div className="relative p-4 bg-gradient-to-r from-amber-100/40 via-rose-100/30 to-amber-50/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-amber-400/30 to-rose-400/20 rounded-xl">
                      <MessageCircle className="h-4 w-4 text-amber-600" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Comments</h3>
                  </div>
                </div>
                
                {/* Friendly divider */}
                <div className="h-0.5 bg-gradient-to-r from-transparent via-rose-300/40 to-transparent" />
                
                <div className="relative p-4">
                  {isAuthenticated ? (
                    <VideoComments videoId={video?.id || ""} />
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground text-sm mb-3">
                        Join the conversation!
                      </p>
                      <Link 
                        to="/auth" 
                        className="inline-block px-5 py-2 bg-gradient-to-r from-amber-400 to-rose-400 text-white rounded-full text-sm font-medium hover:from-amber-500 hover:to-rose-500 transition-all"
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
