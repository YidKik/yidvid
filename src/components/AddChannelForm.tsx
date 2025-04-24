
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChannelInput } from "@/components/youtube/ChannelInput";
import { addChannel } from "@/utils/youtube-channel";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AddChannelFormProps {
  onClose?: () => void;
  onSuccess?: () => void;
}

export const AddChannelForm = ({ onClose, onSuccess }: AddChannelFormProps) => {
  const [channelId, setChannelId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isQuotaExceeded, setIsQuotaExceeded] = useState(false);
  const [isForbidden, setIsForbidden] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsQuotaExceeded(false);
    setIsForbidden(false);
    
    if (!channelId.trim()) {
      toast.error("Please enter a channel ID or URL", { id: "channel-empty" });
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await addChannel(channelId);
      
      toast.success("Channel added successfully!", { id: "channel-added" });
      
      setChannelId("");
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error adding channel:", error);
      
      let message = "There was a problem adding the channel. Please try again.";
      
      // Try to extract the actual error message
      if (typeof error === 'object' && error && 'message' in error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      
      // Check for specific error types
      if (message.toLowerCase().includes('quota')) {
        setIsQuotaExceeded(true);
      } else if (message.toLowerCase().includes('forbidden') || message.toLowerCase().includes('403')) {
        setIsForbidden(true);
      }
      
      setErrorMessage(message);
      
      toast.error(message, { id: "channel-add-error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <ChannelInput
          value={channelId}
          onChange={setChannelId}
          disabled={isLoading}
        />
        <p className="text-sm text-muted-foreground">
          Enter a YouTube channel URL (e.g., https://www.youtube.com/@channelname) or channel handle (e.g., @channelname)
        </p>
      </div>
      
      {isQuotaExceeded && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>YouTube API Quota Exceeded</AlertTitle>
          <AlertDescription className="mt-1">
            The YouTube API quota has been exceeded. This is a limitation imposed by YouTube and resets daily.
            Please try again tomorrow when the quota refreshes.
          </AlertDescription>
        </Alert>
      )}
      
      {isForbidden && (
        <Alert variant="destructive" className="bg-destructive/10 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Access Forbidden</AlertTitle>
          <AlertDescription className="mt-1">
            YouTube has rejected our request. This might be due to API key restrictions or service issues.
            Please try again later or contact support if the problem persists.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && !isQuotaExceeded && !isForbidden && (
        <div className="bg-destructive/15 p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}
      
      <Button 
        type="submit" 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Adding Channel..." : "Add Channel"}
      </Button>
    </form>
  );
};
