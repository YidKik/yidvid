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
      <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl">
              <Play className="h-5 w-5 text-primary fill-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">More from {channelName}</h2>
              <p className="text-sm text-muted-foreground">Loading videos...</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {[...Array(compact ? 4 : 6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video bg-muted/50 rounded-2xl"></div>
                <div className="mt-3 space-y-2">
                  <div className="h-3 bg-muted/50 rounded-full w-full"></div>
                  <div className="h-2.5 bg-muted/40 rounded-full w-3/4"></div>
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
      <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl">
              <Tv className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground">More from {channelName}</h2>
          </div>
        </div>
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Tv className="h-10 w-10 text-primary/50" />
          </div>
          <p className="text-muted-foreground">
            No other videos found from this channel
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card via-card to-primary/5 rounded-3xl shadow-2xl shadow-primary/10 overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 rounded-t-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/20 rounded-2xl">
              <Play className="h-5 w-5 text-primary fill-primary" />
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
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors px-5 py-2.5 bg-primary/10 rounded-full hover:bg-primary/20"
            >
              View Channel
            </Link>
          )}
        </div>
      </div>
      
      {/* Videos Grid - 3 big videos per row */}
      <div className="p-6">
        <div className={`grid gap-6 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
          {videos.slice(0, compact ? 6 : 9).map((video) => (
            <div 
              key={video.id}
              className="group transition-all duration-300 hover:scale-[1.02]"
            >
              <div className="bg-gradient-to-br from-background via-background to-primary/5 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl hover:shadow-primary/10 transition-all">
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-primary/10 via-primary/15 to-primary/10 hover:from-primary/20 hover:via-primary/25 hover:to-primary/20 rounded-full text-sm font-semibold text-foreground transition-all hover:shadow-lg"
            >
              <Play className="h-4 w-4 text-primary fill-primary" />
              See all {videos.length} videos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
