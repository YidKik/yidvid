
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface VideoAlertStatusProps {
  isRefreshing: boolean;
  fetchAttempts: number;
  lastSuccessfulFetch: Date | null;
  refetch?: () => Promise<any>;
  isLoading: boolean;
  isMobile?: boolean;
}

export const VideoAlertStatus = ({
  isRefreshing,
  fetchAttempts,
  lastSuccessfulFetch,
  refetch,
  isLoading,
  isMobile = false
}: VideoAlertStatusProps) => {
  if (isLoading) return null;
  
  const getStatusText = () => {
    if (!lastSuccessfulFetch) {
      if (fetchAttempts > 3) {
        return "We're having trouble loading videos. Please try again later.";
      }
      return "Loading videos...";
    }

    const timeAgo = formatDistanceToNow(new Date(lastSuccessfulFetch), { addSuffix: true });
    
    if (fetchAttempts > 3) {
      return `Last updated ${timeAgo}. We're having trouble fetching new videos.`;
    }
    
    return `Videos updated ${timeAgo}`;
  };

  const statusText = getStatusText();

  if (isMobile) {
    return (
      <div className="flex items-center justify-between px-4 py-1 mb-1 text-xs text-muted-foreground">
        <span>{statusText}</span>
        {refetch && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={refetch}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh videos</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-b">
      <span>{statusText}</span>
      {refetch && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={refetch}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      )}
    </div>
  );
};
