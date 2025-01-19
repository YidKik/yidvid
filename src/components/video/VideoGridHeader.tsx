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
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Your Video Dashboard</h2>
        <p className="text-muted-foreground mb-8">
          Get started by adding your favorite YouTube channels
        </p>
        <Link to="/dashboard">
          <Button size="lg">Add Channels</Button>
        </Link>
      </div>
    );
  }

  if (!hasVideos) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  return null;
};