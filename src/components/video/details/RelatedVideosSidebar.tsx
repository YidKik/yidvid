import { VideoCard } from "@/components/VideoCard";

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

interface RelatedVideosSidebarProps {
  videos?: Video[];
  isLoading?: boolean;
  channelName?: string;
}

export const RelatedVideosSidebar = ({ 
  videos, 
  isLoading = false,
  channelName = "this channel"
}: RelatedVideosSidebarProps) => {
  
  if (isLoading) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">More Videos</h2>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-28 h-16 bg-muted rounded-lg flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
                <div className="h-2 bg-muted/60 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border/30 p-5">
        <h2 className="text-lg font-semibold text-foreground mb-4">More Videos</h2>
        <p className="text-muted-foreground text-sm text-center py-8">
          No other videos found from {channelName}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/30 overflow-hidden">
      <div className="p-5 border-b border-border/20">
        <h2 className="text-lg font-semibold text-foreground">
          More from {channelName}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {videos.length} video{videos.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="max-h-[600px] overflow-y-auto">
        <div className="p-3 space-y-2">
          {videos.slice(0, 10).map((video, index) => (
            <div 
              key={video.id}
              className="group hover:bg-accent/40 rounded-lg p-2 transition-colors"
            >
              <VideoCard
                id={video.id}
                video_id={video.video_id}
                title={video.title}
                thumbnail={video.thumbnail || "/placeholder.svg"}
                channelName={video.channel_name}
                channelId={video.channel_id}
                views={video.views}
                uploadedAt={video.uploaded_at}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
