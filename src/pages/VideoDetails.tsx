import React, { useEffect, useRef } from 'react';
import { useParams, Link, useLocation } from "react-router-dom";
import { VideoPlayer } from "@/components/video/VideoPlayer";
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
import { MessageCircle, ListMusic, Shuffle } from "lucide-react";
import { usePageLoader } from "@/contexts/LoadingContext";
import { usePlaylistAutoplay } from "@/hooks/video/usePlaylistAutoplay";

const VideoDetails = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const location = useLocation();
  const { isMobile, isTablet } = useIsMobile();
  const { isAuthenticated, session } = useAuth();
  const incrementView = useIncrementVideoView();
  const viewIncrementedRef = useRef<string | null>(null);
  const { isPlaylistMode, totalVideos, currentPosition, goToNextVideo } = usePlaylistAutoplay(videoId || "");
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

  const isLoading = isLoadingVideo || isLoadingRelated;
  usePageLoader('video-details', isLoading);

  if (!video || error) {
    if (!isLoadingVideo) {
      console.error("Video not found or error:", error, "for videoId:", videoId);
    }
    return (
      <div className="min-h-screen bg-white pt-14 pl-0 lg:pl-[200px] transition-all duration-300">
        <div className="p-4">
          <div className="p-8 text-center bg-[#F5F5F5] rounded-2xl mt-6">
            <div className="mx-auto mb-6 w-full max-w-md aspect-video flex items-center justify-center bg-white rounded-xl">
              <VideoPlaceholder size="large" />
            </div>
            <h2 className="text-xl font-semibold text-destructive">
              {isLoadingVideo ? "Loading..." : "Video not found"}
            </h2>
            {!isLoadingVideo && (
              <>
                <p className="mt-2 text-[#666666]">
                  {error ? `Error: ${error.message}` : "The video you're looking for doesn't exist or has been removed."}
                </p>
                <Link to="/videos" className="mt-4 inline-block px-6 py-3 bg-[#FF0000] text-white rounded-full font-medium hover:brightness-90 transition-all">
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
      
      <div className="min-h-screen bg-white pt-14 pl-0 lg:pl-[200px] pb-20 lg:pb-0 transition-all duration-300">
        <div className="px-4 lg:px-6 pt-4 pb-12">
          
        {/* Desktop Layout - two column */}
          {!isMobile && !isTablet && (
            <div className="mt-4 flex gap-6">
              {/* Left Column - Video, Title, Actions, Channel, More Videos */}
              <div className="flex-1 min-w-0">
                {/* Video Player - clean, no card wrapper */}
                <div className="rounded-xl overflow-hidden bg-black relative">
                  <VideoPlayer videoId={video?.video_id || ""} onVideoEnd={isPlaylistMode ? goToNextVideo : undefined} />
                  {isPlaylistMode && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                      <ListMusic className="w-3.5 h-3.5" />
                      <Shuffle className="w-3 h-3 opacity-70" />
                      <span>{currentPosition}/{totalVideos}</span>
                    </div>
                  )}
                </div>
                
                {/* Title */}
                <h1 className="text-xl font-bold text-[#1A1A1A] leading-tight mt-4">
                  {video?.title}
                </h1>
                
                {/* Action Buttons */}
                <div className="mt-3">
                  <FriendlyVideoActionBar 
                    videoId={video?.id || ""} 
                    youtubeVideoId={video?.video_id || ""}
                    views={video?.views || 0}
                    uploadedAt={video?.uploaded_at || ""}
                  />
                </div>
                
                {/* Thin divider */}
                <div className="h-px bg-[#E5E5E5] my-4" />
                
                {/* Channel + Description + More Videos */}
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
              <div className="w-[380px] flex-shrink-0">
                <div className="bg-[#F5F5F5] rounded-t-xl sticky top-20 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 6rem)' }}>
                  {/* Simple header */}
                  <div className="px-5 py-4 border-b border-[#E5E5E5] bg-white flex-shrink-0">
                    <h3 className="text-base font-semibold text-[#1A1A1A] flex items-center gap-2">
                      <MessageCircle className="h-4 w-4 text-[#999999]" />
                      Comments
                    </h3>
                  </div>
                  
                  {/* Comments Content */}
                  <div className="p-4 overflow-y-auto flex-1">
                    {isAuthenticated ? (
                      <VideoComments videoId={video?.id || ""} />
                    ) : (
                      <div className="text-center py-10">
                        <MessageCircle className="h-8 w-8 text-[#999999] mx-auto mb-3" />
                        <p className="text-[#666666] text-sm mb-4">
                          Sign in to view and post comments.
                        </p>
                        <Link 
                          to="/auth" 
                          className="inline-block px-5 py-2 bg-[#FF0000] text-white rounded-full text-sm font-medium hover:brightness-90 transition-all"
                        >
                          Sign In
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Mobile Layout */}
          {isMobile && (
            <div className="mt-2 space-y-4">
              {/* Video Player */}
              <div className="rounded-xl overflow-hidden bg-black -mx-6 relative">
                <VideoPlayer videoId={video?.video_id || ""} onVideoEnd={isPlaylistMode ? goToNextVideo : undefined} />
                {isPlaylistMode && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/70 text-white text-xs font-medium px-2.5 py-1.5 rounded-full backdrop-blur-sm">
                    <ListMusic className="w-3.5 h-3.5" />
                    <Shuffle className="w-3 h-3 opacity-70" />
                    <span>{currentPosition}/{totalVideos}</span>
                  </div>
                )}
              </div>
              
              {/* Title */}
              <h1 className="text-lg font-bold text-[#1A1A1A] leading-tight">
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
              
              {/* Divider */}
              <div className="h-px bg-[#E5E5E5]" />
              
              {/* Channel + Description + More Videos */}
              <FriendlyChannelSection
                channelName={video?.channel_name || ""}
                channelId={video?.channel_id || ""}
                channelThumbnail={video?.youtube_channels?.thumbnail_url || ""}
                description={video?.description || ""}
                channelVideos={channelVideos}
                isLoadingVideos={isLoadingRelated}
                compact
              />
              
              {/* Divider */}
              <div className="h-px bg-[#E5E5E5]" />
              
              {/* Comments - Mobile */}
              <div className="bg-[#F5F5F5] rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-[#E5E5E5] bg-white">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-[#999999]" />
                    Comments
                  </h3>
                </div>
                
                <div className="p-4">
                  {isAuthenticated ? (
                    <VideoComments videoId={video?.id || ""} />
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-7 w-7 text-[#999999] mx-auto mb-3" />
                      <p className="text-[#666666] text-sm mb-3">
                        Sign in to view and post comments.
                      </p>
                      <Link 
                        to="/auth" 
                        className="inline-block px-5 py-2 bg-[#FF0000] text-white rounded-full text-sm font-medium hover:brightness-90 transition-all"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoDetails;
