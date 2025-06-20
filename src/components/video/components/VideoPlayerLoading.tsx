
import { VideoPlaceholder } from "../VideoPlaceholder";

interface VideoPlayerLoadingProps {
  isLoading: boolean;
}

export const VideoPlayerLoading = ({ isLoading }: VideoPlayerLoadingProps) => {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/30 z-10">
      <VideoPlaceholder size="medium" />
    </div>
  );
};
