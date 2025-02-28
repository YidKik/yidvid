
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

  const handleRefresh = async () => {
    if (refetch) {
      await refetch();
    }
  };

  if (!showAlert) return null;

  return (
    <Alert className={`mb-4 ${isMobile ? 'mx-2' : ''}`} variant={fetchAttempts > 3 ? "destructive" : "default"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Video Loading Status</AlertTitle>
      <AlertDescription className={isMobile ? "flex flex-col gap-2" : "flex items-center justify-between"}>
        <div>
          {isRefreshing ? (
            isMobile ? 
              "Checking for new videos... Please wait." : 
              "Checking for new videos across all channels... This may take a moment."
          ) : fetchAttempts > 3 ? (
            isMobile ? 
              "We're experiencing technical difficulties with video fetching. We'll keep trying automatically." : 
              "We're experiencing technical difficulties with our YouTube video fetching service. We'll keep trying automatically."
          ) : (
            isMobile ? 
              "Some videos might not be loading correctly. We're working on it." : 
              "Some YouTube videos might not be loading correctly. Our team is working to resolve this as quickly as possible."
          )}
          <div className="text-xs opacity-80 mt-1">Last successful update: {lastUpdateTime}</div>
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
            {isRefreshing ? "Refreshing..." : "Refresh Videos"}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
