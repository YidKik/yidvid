
import { Button } from "@/components/ui/button";
import { VideoPlaceholder } from "@/components/video/VideoPlaceholder";
import { BackButton } from "@/components/navigation/BackButton";

interface ChannelErrorStateProps {
  error?: Error;
  onRetry: () => void;
  onGoHome: () => void;
  isRetrying: boolean;
}

export const ChannelErrorState = ({
  error,
  onRetry,
  onGoHome,
  isRetrying
}: ChannelErrorStateProps) => {
  // Specific error message based on the error
  const errorMessage = error?.message || "The channel could not be loaded. It may have been removed or there might be a temporary issue.";
  
  return (
    <div className="container mx-auto p-4 mt-16">
      <BackButton />
      <div className="flex flex-col items-center justify-center min-h-[300px] p-6 border border-gray-200 rounded-lg bg-white/50 shadow-sm">
        <VideoPlaceholder size="medium" />
        <h2 className="text-xl font-semibold text-destructive mt-6">Channel not found</h2>
        <p className="text-muted-foreground mt-2 text-center max-w-md">
          {errorMessage}
        </p>
        <div className="flex gap-4 mt-6">
          <Button onClick={onGoHome} variant="default">
            Return Home
          </Button>
          <Button onClick={onRetry} variant="outline" disabled={isRetrying}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
};
