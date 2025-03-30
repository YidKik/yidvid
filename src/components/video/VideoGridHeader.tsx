
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface VideoGridHeaderProps {
  isLoading: boolean;
  hasChannels: boolean;
  hasVideos: boolean;
}

export const VideoGridHeader = ({
  isLoading,
  hasChannels,
  hasVideos,
}: VideoGridHeaderProps) => {
  if (isLoading) {
    return <div className="h-8 animate-pulse bg-muted rounded w-64" />;
  }

  if (!hasChannels) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-b border-primary/30">
        <h2 className="text-2xl font-bold mb-4">No channels added yet</h2>
        <p className="text-muted-foreground mb-4">
          Start by adding some YouTube channels to see their videos here
        </p>
        <Link to="/dashboard">
          <Button>Add Channels</Button>
        </Link>
      </div>
    );
  }

  if (!hasVideos) {
    return (
      <div className="flex items-center justify-center p-8 border-b border-primary/30">
        <p className="text-muted-foreground">
          No videos found. Try adding more channels or check back later.
        </p>
      </div>
    );
  }

  return null;
};
