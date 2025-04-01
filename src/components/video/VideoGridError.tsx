
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

interface VideoGridErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const VideoGridError = ({ 
  message = "Failed to load videos", 
  onRetry 
}: VideoGridErrorProps) => {
  const { isMobile } = useIsMobile();
  
  return (
    <div className={`flex flex-col items-center justify-center gap-4 ${isMobile ? 'p-4' : 'p-8'}`}>
      <p className="text-muted-foreground text-center">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" size={isMobile ? "sm" : "default"}>
          Try Again
        </Button>
      )}
    </div>
  );
};
