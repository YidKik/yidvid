import { VideoCard } from "@/components/VideoCard";
import { Loader2 } from "lucide-react";

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
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">More Videos</h2>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground mb-4">More Videos</h2>
        <p className="text-muted-foreground text-sm text-center py-8">
          No other videos found from {channelName}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="p-5 border-b border-border bg-muted/30">
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
              className="group hover:bg-muted/50 rounded-lg p-2 transition-colors"
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
