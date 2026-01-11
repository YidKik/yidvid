interface VideoPlayerLoadingProps {
  isLoading: boolean;
}

export const VideoPlayerLoading = ({ isLoading }: VideoPlayerLoadingProps) => {
  if (!isLoading) return null;

  // Return empty/minimal state - yellow loading bar at top handles loading indication
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-muted/20 z-10">
      {/* Intentionally empty - loading indicated by yellow progress bar at top */}
    </div>
  );
};
