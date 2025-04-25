
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
  const [isChannelNotFound, setIsChannelNotFound] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset all error states
    setErrorMessage(null);
    setIsQuotaExceeded(false);
    setIsForbidden(false);
    setIsChannelNotFound(false);
    
    if (!channelId.trim()) {
      toast.error("Please enter a channel ID or URL", { id: "channel-empty" });
      return;
    }

    setIsLoading(true);
    
    try {
      console.log("Starting channel add process for:", channelId);
      const result = await addChannel(channelId);
      
      console.log("Channel add successful:", result);
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
      
      // Check for specific error types for better UI feedback
      const errorLower = message.toLowerCase();
      if (errorLower.includes('quota')) {
        setIsQuotaExceeded(true);
      } else if (errorLower.includes('forbidden') || errorLower.includes('403')) {
        setIsForbidden(true);
      } else if (errorLower.includes('not found') || errorLower.includes('404')) {
        setIsChannelNotFound(true);
      }
      
      setErrorMessage(message);
      toast.error(message, { id: "channel-add-error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <div className="mb-4">
        <label htmlFor="channelInput" className="block text-gray-700 text-sm font-bold mb-2">
          YouTube Channel URL or Handle
        </label>
        <div className="shadow-sm">
          <ChannelInput
            id="channelInput"
            value={channelId}
            onChange={setChannelId}
            disabled={isLoading}
            className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <p className="text-gray-500 text-xs mt-2">
          Enter a YouTube channel URL (e.g., https://www.youtube.com/@channelname) or channel handle (e.g., @channelname)
        </p>
      </div>
      
      {isQuotaExceeded && (
        <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800">YouTube API Quota Exceeded</AlertTitle>
          <AlertDescription className="text-red-600">
            The YouTube API quota has been exceeded. Please try again tomorrow.
          </AlertDescription>
        </Alert>
      )}
      
      {isForbidden && (
        <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800">API Access Forbidden</AlertTitle>
          <AlertDescription className="text-red-600">
            YouTube has rejected our request. Please try again later.
          </AlertDescription>
        </Alert>
      )}
      
      {isChannelNotFound && (
        <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-800">Channel Not Found</AlertTitle>
          <AlertDescription className="text-red-600">
            The YouTube channel could not be found. Please verify the channel ID or URL.
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && !isQuotaExceeded && !isForbidden && !isChannelNotFound && (
        <div className="mb-4 p-3 border border-red-300 rounded bg-red-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <p className="text-sm text-red-600">{errorMessage}</p>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-end gap-4">
        <Button 
          type="button"
          variant="outline"
          onClick={onClose}
          className="py-2 px-4 rounded hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          {isLoading ? "Adding Channel..." : "Add Channel"}
        </Button>
      </div>
    </form>
  );
};
