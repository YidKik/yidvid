
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsQuotaExceeded(false);
    
    if (!channelId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a channel ID or URL"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      toast({
        title: "Adding channel...",
        description: "Please wait while we process your request."
      });

      const result = await addChannel(channelId);
      
      toast({
        title: "Success",
        description: "Channel added successfully!",
        variant: "default"
      });
      
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
      
      // Check for quota exceeded
      if (message.toLowerCase().includes('quota')) {
        setIsQuotaExceeded(true);
      }
      
      setErrorMessage(message);
      
      toast({
        variant: "destructive",
        title: "Failed to add channel",
        description: message
      });
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
      
      {errorMessage && !isQuotaExceeded && (
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
