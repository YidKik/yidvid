
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const showAlert = fetchAttempts > 1 || isRefreshing;
  const lastUpdateTime = lastSuccessfulFetch ? 
    new Intl.DateTimeFormat('en-US', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    }).format(lastSuccessfulFetch) : 'No recent update';

  // Calculate time since last update in hours
  const hoursSinceUpdate = lastSuccessfulFetch ? 
    Math.floor((Date.now() - lastSuccessfulFetch.getTime()) / (1000 * 60 * 60)) : null;

  const handleRefresh = async () => {
    if (refetch) {
      await refetch();
    }
  };

  if (!showAlert && (!lastSuccessfulFetch || hoursSinceUpdate === null || hoursSinceUpdate < 24)) return null;

  return (
    <Alert className={`mb-4 ${isMobile ? 'mx-2' : ''}`} variant={fetchAttempts > 3 ? "destructive" : "default"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Video Content Updates</AlertTitle>
      <AlertDescription className={isMobile ? "flex flex-col gap-2" : "flex items-center justify-between"}>
        <div>
          {isRefreshing ? (
            isMobile ? 
              "Checking for new videos... Please wait." : 
              "Checking for new videos across selected channels... This may take a moment."
          ) : fetchAttempts > 3 ? (
            isMobile ? 
              "We're experiencing technical difficulties with video fetching. New videos will be checked automatically twice daily." : 
              "We're experiencing technical difficulties with our video fetching service. To conserve API quota, new videos are checked automatically twice daily."
          ) : hoursSinceUpdate !== null && hoursSinceUpdate > 24 ? (
            isMobile ?
              "Videos haven't been updated in over 24 hours." :
              "Videos haven't been updated in over 24 hours. You can manually refresh below if needed."
          ) : (
            isMobile ? 
              "Some videos might be delayed in appearing. We're optimizing API usage." : 
              "Some videos might be delayed in appearing. We're optimizing our API usage to ensure service availability."
          )}
          <div className="text-xs opacity-80 mt-1">
            Last successful update: {lastUpdateTime}
          </div>
          <div className="text-xs opacity-80 mt-1">
            <strong>Note:</strong> To conserve YouTube API quota, new videos are fetched automatically twice daily. 
            Manual refresh is available for immediate updates but uses limited daily API resources.
          </div>
        </div>
        
        {refetch && (
          <Button 
            size="sm" 
            variant="outline" 
            className={`${isMobile ? "w-full mt-1" : "ml-4 whitespace-nowrap"} gap-2`}
            onClick={handleRefresh}
            disabled={isLoading || isRefreshing}
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            {isRefreshing ? "Refreshing..." : "Refresh Now"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
