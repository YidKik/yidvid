import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChannelInput } from "@/components/youtube/ChannelInput";
import { addChannel, addChannelManually } from "@/utils/youtube-channel";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { extractChannelId } from "@/utils/youtube/extract-channel-id";

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
  
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualChannelId, setManualChannelId] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualThumbnail, setManualThumbnail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      if (typeof error === 'object' && error && 'message' in error) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }
      
      const errorLower = message.toLowerCase();
      if (errorLower.includes('quota')) {
        setIsQuotaExceeded(true);
        setShowManualEntry(true);
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
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manualChannelId.trim() || !manualTitle.trim()) {
      toast.error("Channel ID and title are required for manual entry", { id: "manual-entry-empty" });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await addChannelManually({
        channel_id: manualChannelId,
        title: manualTitle,
        thumbnail_url: manualThumbnail || undefined
      });
      
      console.log("Manual channel add successful:", result);
      toast.success("Channel added manually!", { id: "channel-added-manually" });
      
      setManualChannelId("");
      setManualTitle("");
      setManualThumbnail("");
      setShowManualEntry(false);
      
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error adding channel manually:", error);
      toast.error(error.message || "Failed to add channel manually", { id: "manual-add-error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelInputChange = (value: string) => {
    const extractedId = extractChannelId(value);
    setManualChannelId(extractedId);
  };

  return (
    <div>
      {!showManualEntry ? (
        <form 
          onSubmit={handleSubmit} 
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-4">
            <label 
              htmlFor="channelInput" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              YouTube Channel URL or Handle
            </label>
            <ChannelInput
              value={channelId}
              onChange={setChannelId}
              disabled={isLoading}
              placeholder="Enter channel URL, @handle, or ID"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-gray-500 text-xs mt-2">
              Enter a YouTube channel URL (e.g., https://www.youtube.com/@channelname) or channel handle (e.g., @channelname)
            </p>
          </div>
          
          {isQuotaExceeded && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-red-800">YouTube API Quota Exceeded</AlertTitle>
              <AlertDescription className="text-red-600">
                <p>The YouTube API quota has been exceeded. You can:</p>
                <ul className="list-disc pl-5 mt-1">
                  <li>Try again tomorrow when the quota resets</li>
                  <li>
                    <Button 
                      variant="link" 
                      className="text-red-600 p-0 h-auto font-semibold" 
                      onClick={() => setShowManualEntry(true)}
                    >
                      Add channel manually
                    </Button>
                  </li>
                </ul>
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
          
          <div className="flex items-center justify-between">
            <Button 
              type="button"
              variant="secondary"
              onClick={onClose}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={isLoading}
            >
              Close
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
      ) : (
        <form 
          onSubmit={handleManualSubmit} 
          className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="mb-2">
            <h3 className="font-bold text-lg">Manual Channel Entry</h3>
            <p className="text-sm text-gray-500 mb-4">
              Enter a YouTube channel URL, handle (@username), or ID, and we'll help you extract the correct channel ID.
            </p>
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="channelInput" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Channel URL or Handle <span className="text-red-500">*</span>
            </label>
            <Input
              id="channelInput"
              onChange={(e) => handleChannelInputChange(e.target.value)}
              placeholder="e.g., https://youtube.com/@channelname or @channelname"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
            />
            <div className="mt-2">
              <label 
                htmlFor="manualChannelId" 
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Extracted Channel ID
              </label>
              <Input
                id="manualChannelId"
                value={manualChannelId}
                onChange={(e) => setManualChannelId(e.target.value)}
                className="bg-gray-50 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                readOnly
              />
              <p className="text-gray-500 text-xs mt-1">
                This is the extracted channel ID that will be used.
              </p>
            </div>
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="manualTitle" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Channel Title <span className="text-red-500">*</span>
            </label>
            <Input
              id="manualTitle"
              value={manualTitle}
              onChange={(e) => setManualTitle(e.target.value)}
              placeholder="e.g., Channel Name"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="manualThumbnail" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Thumbnail URL (optional)
            </label>
            <Input
              id="manualThumbnail"
              value={manualThumbnail}
              onChange={(e) => setManualThumbnail(e.target.value)}
              placeholder="e.g., https://example.com/thumbnail.jpg"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            <p className="text-gray-500 text-xs mt-1">
              URL of the channel thumbnail image
            </p>
          </div>
          
          <div className="flex items-center justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setShowManualEntry(false)}
              className="border-gray-300 text-gray-700"
              disabled={isLoading}
            >
              Back to Auto Add
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !manualChannelId || !manualTitle}
              className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              {isLoading ? "Adding Channel..." : "Add Channel Manually"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
