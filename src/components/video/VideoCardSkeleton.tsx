
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";

interface VideoCardSkeletonProps {
  hideInfo?: boolean;
  className?: string;
}

export const VideoCardSkeleton = ({ hideInfo = false, className }: VideoCardSkeletonProps) => {
  return (
    <div className={className}>
      <div className="relative w-full overflow-hidden rounded-lg bg-muted/30">
        <div className="aspect-video w-full overflow-hidden">
          <VideoPlaceholder size="small" />
        </div>
      </div>
      
      {!hideInfo && (
        <div className="mt-2 flex items-start space-x-2 animate-pulse">
          <div className="flex-shrink-0 mt-0.5">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-muted rounded w-3/4 mb-1"></div>
            <div className="h-3 bg-muted/70 rounded w-1/2 mt-1"></div>
          </div>
        </div>
      )}
    </div>
  );
};
