import { VideoCard } from "@/components/VideoCard";
import { Play, Tv } from "lucide-react";
import { Link } from "react-router-dom";

interface Video {
  id: string;
  video_id: string;
  title: string;
  thumbnail: string;
  channel_name: string;
  channel_id: string;
  views: number;
  uploaded_at: string | Date;
}

interface FriendlyRelatedVideosProps {
  videos?: Video[];
  isLoading?: boolean;
  channelName?: string;
  compact?: boolean;
}

export const FriendlyRelatedVideos = ({ 
  videos, 
  isLoading = false,
  channelName = "this channel",
  compact = false
}: FriendlyRelatedVideosProps) => {

  if (isLoading) {
    return (
      <div className="relative bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-amber-200/30">
        {/* Warm gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/25 via-transparent to-rose-50/20 pointer-events-none" />
        
        <div className="relative p-6 bg-gradient-to-r from-amber-100/40 via-rose-100/25 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400/30 to-rose-400/20 rounded-2xl">
              <Play className="h-5 w-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">More from {channelName}</h2>
              <p className="text-sm text-muted-foreground">Loading videos...</p>
            </div>
          </div>
        </div>
        {/* Friendly divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="relative p-6">
          <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(compact ? 4 : 6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-amber-100/30 rounded-2xl"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-amber-100/40 rounded-full w-full"></div>
                  <div className="h-2.5 bg-rose-100/30 rounded-full w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="relative bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-amber-200/30">
        {/* Warm gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/25 via-transparent to-rose-50/20 pointer-events-none" />
        
        <div className="relative p-6 bg-gradient-to-r from-amber-100/40 via-rose-100/25 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400/30 to-rose-400/20 rounded-2xl">
              <Tv className="h-5 w-5 text-amber-600" />
            </div>
            <h2 className="text-lg font-bold text-foreground">More from {channelName}</h2>
          </div>
        </div>
        {/* Friendly divider */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="relative p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-amber-100 to-rose-100 rounded-full flex items-center justify-center">
            <Tv className="h-10 w-10 text-amber-400" />
          </div>
          <p className="text-muted-foreground">
            No other videos found from this channel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-card/80 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-amber-200/30">
      {/* Warm gradient glow background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/25 via-transparent to-rose-50/20 pointer-events-none" />
      
      {/* Header */}
      <div className="relative p-6 bg-gradient-to-r from-amber-100/40 via-rose-100/25 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-400/30 to-rose-400/20 rounded-2xl">
              <Play className="h-5 w-5 text-amber-600 fill-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                More from {channelName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {videos.length} more video{videos.length !== 1 ? 's' : ''} to explore
              </p>
            </div>
          </div>
          
          {/* View Channel Link */}
          {videos[0]?.channel_id && (
            <Link 
              to={`/channel/${videos[0].channel_id}`}
              className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors px-5 py-2.5 bg-amber-100/50 rounded-full hover:bg-amber-100/80"
            >
              View Channel
            </Link>
          )}
        </div>
      </div>
      
      {/* Friendly gradient divider */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      
      {/* Videos Grid - 3 big videos per row */}
      <div className="relative p-6">
        <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {videos.slice(0, compact ? 6 : 9).map((video) => (
            <div 
              key={video.id}
              className="group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="bg-card/60 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-amber-200/30 transition-all border border-amber-100/20">
                <VideoCard
                  id={video.id}
                  video_id={video.video_id}
                  title={video.title}
                  thumbnail={video.thumbnail || "/placeholder.svg"}
                  channelName={video.channel_name}
                  channelId={video.channel_id}
                  views={video.views}
                  uploadedAt={video.uploaded_at}
                  hideChannelName
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Show more hint if there are more videos */}
        {videos.length > (compact ? 6 : 9) && videos[0]?.channel_id && (
          <div className="mt-8 text-center">
            <Link 
              to={`/channel/${videos[0].channel_id}`}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-100/50 via-rose-100/40 to-amber-100/50 hover:from-amber-200/60 hover:via-rose-200/50 hover:to-amber-200/60 rounded-full text-sm font-semibold text-foreground transition-all hover:shadow-lg border border-amber-200/30"
            >
              <Play className="h-4 w-4 text-amber-600 fill-amber-600" />
              See all {videos.length} videos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
