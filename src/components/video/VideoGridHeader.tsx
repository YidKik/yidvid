interface VideoGridHeaderProps {
  isLoading: boolean;
  hasChannels: boolean;
  hasVideos: boolean;
}

export const VideoGridHeader = ({ isLoading, hasChannels, hasVideos }: VideoGridHeaderProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-muted-foreground">Loading videos...</p>
      </div>
    );
  }

  if (!hasChannels) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-muted-foreground">No channels added yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first channel in the dashboard
        </p>
      </div>
    );
  }

  if (!hasVideos) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] gap-2">
        <p className="text-muted-foreground">No videos found</p>
        <p className="text-sm text-muted-foreground">
          Videos will appear here once they are fetched from your channels
        </p>
      </div>
    );
  }

  return null;
};