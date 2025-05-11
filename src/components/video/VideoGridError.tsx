
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";
import { useState } from "react";

interface VideoGridErrorProps {
  message?: string;
  onRetry?: () => void;
  networkError?: boolean;
}

export const VideoGridError = ({ 
  message = "Failed to load videos", 
  onRetry,
  networkError = false
}: VideoGridErrorProps) => {
  const { isMobile } = useIsMobile();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsLoading(true);
    try {
      await onRetry();
    } finally {
      // Add a slight delay for better UX
      setTimeout(() => setIsLoading(false), 800);
    }
  };
  
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${isMobile ? 'p-4' : 'p-8'}`}>
      <div className="flex items-center gap-2 text-amber-600">
        {networkError ? (
          <WifiOff className="h-5 w-5" />
        ) : (
          <AlertCircle className="h-5 w-5" />
        )}
        <p className="text-muted-foreground text-center">{message}</p>
      </div>
      
      {onRetry && (
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          size={isMobile ? "sm" : "default"}
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </>
          )}
        </Button>
      )}
      
      {networkError && (
        <p className="text-xs text-muted-foreground mt-2 max-w-md text-center">
          It seems like you're experiencing connection issues. We'll show sample videos until your connection improves.
        </p>
      )}
    </div>
  );
};
