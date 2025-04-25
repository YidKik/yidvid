
import { useState, useEffect } from "react";
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
  const [manualDescription, setManualDescription] = useState("");
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [quotaResetTime, setQuotaResetTime] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setErrorMessage(null);
    setIsQuotaExceeded(false);
    setIsForbidden(false);
    setIsChannelNotFound(false);
    setQuotaResetTime(null);
    
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
        
        // Check for quota reset time in the error message
        if (typeof error === 'object' && error && 'quotaResetAt' in error) {
          setQuotaResetTime(error.quotaResetAt);
        }
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
        description: manualDescription || undefined,
        thumbnail_url: manualThumbnail || undefined
      });
      
      console.log("Manual channel add successful:", result);
      toast.success("Channel added manually!", { id: "channel-added-manually" });
      
      setManualChannelId("");
      setManualTitle("");
      setManualThumbnail("");
      setManualDescription("");
      setShowManualEntry(false);
      
      onSuccess?.();
      onClose?.();
    } catch (error: any) {
      console.error("Error adding channel manually:", error);
      const errorMessage = error?.message || "Failed to add channel manually";
      toast.error(errorMessage, { id: "manual-add-error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChannelInputChange = async (value: string) => {
    const extractedId = extractChannelId(value);
    setManualChannelId(extractedId);
    
    if (extractedId) {
      setIsFetchingDetails(true);
      try {
        console.log("Fetching channel details for:", extractedId);
        
        const response = await fetch(
          `https://euincktvsiuztsxcuqfd.supabase.co/functions/v1/fetch-youtube-channel?channelId=${encodeURIComponent(extractedId)}`,
          {
            method: 'GET', // Use GET for just fetching details without adding
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1aW5ja3R2c2l1enRzeGN1cWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0ODgzNzcsImV4cCI6MjA1MjA2NDM3N30.zbReqHoAR33QoCi_wqNp8AtNofTX3JebM7jvjFAWbMg`
            }
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Response data:", data);
          if (data && !data.error) {
            console.log("Channel data fetched:", data);
            setManualTitle(data.title || '');
            setManualDescription(data.description || '');
            setManualThumbnail(data.thumbnail_url || '');
            toast.success("Channel details retrieved successfully");
          } else if (data.error) {
            console.log("Error from API:", data.error);
            if (data.error.toLowerCase().includes('quota')) {
              console.log("Quota exceeded, keeping manual entry mode");
              toast.error("YouTube API quota exceeded. Please enter details manually.");
              
              // Set quota reset time if available
              if (data.quotaResetAt) {
                setQuotaResetTime(data.quotaResetAt);
              }
            } else {
              toast.error(`Error: ${data.error}`);
            }
          }
        } else {
          let errorMessage = "Failed to fetch channel details";
          try {
            const errorText = await response.text();
            console.error("Error response:", response.status, errorText);
            
            try {
              const errorData = JSON.parse(errorText);
              if (errorData.error) {
                errorMessage = errorData.error;
                toast.error(errorData.error);
              }
            } catch (e) {
              toast.error(`Error: ${response.status} ${response.statusText}`);
            }
          } catch (e) {
            toast.error(`Error: ${response.status} ${response.statusText}`);
          }
          
          if (response.status === 429) {
            toast.error("YouTube API quota exceeded. Please enter details manually.");
          } else if (errorMessage.toLowerCase().includes('already been added')) {
            toast.error("This channel has already been added");
          }
        }
      } catch (error) {
        console.error("Error fetching channel details:", error);
        toast.error("Failed to fetch channel details");
      } finally {
        setIsFetchingDetails(false);
      }
    }
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
                {quotaResetTime && (
                  <p className="font-medium mt-1">Quota will reset at: {new Date(quotaResetTime).toLocaleString()}</p>
                )}
                <ul className="list-disc pl-5 mt-1">
                  <li>Try again after the quota resets</li>
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
                YouTube has rejected our request. Please try again later or add the channel manually.
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-300" 
                    onClick={() => setShowManualEntry(true)}
                  >
                    Add channel manually
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          {isChannelNotFound && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border border-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-red-800">Channel Not Found</AlertTitle>
              <AlertDescription className="text-red-600">
                The YouTube channel could not be found. Please verify the channel ID or URL.
                <div className="mt-2">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-300" 
                    onClick={() => setShowManualEntry(true)}
                  >
                    Add channel manually instead
                  </Button>
                </div>
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
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowManualEntry(true)}
                disabled={isLoading}
              >
                Manual Entry
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-primary hover:bg-primary/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {isLoading ? "Adding Channel..." : "Add Channel"}
              </Button>
            </div>
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
              Enter a YouTube channel URL, handle (@username), or ID, and we'll help you extract the correct channel ID and details.
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
              disabled={isFetchingDetails}
            />
            {isFetchingDetails && (
              <p className="text-xs text-blue-600 mb-2">Fetching channel details...</p>
            )}
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
              />
              <p className="text-gray-500 text-xs mt-1">
                This is the extracted channel ID that will be used (should ideally start with UC for YouTube channels).
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
              disabled={isFetchingDetails}
              required
            />
          </div>
          
          <div className="mb-4">
            <label 
              htmlFor="manualDescription" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Description
            </label>
            <textarea
              id="manualDescription"
              value={manualDescription}
              onChange={(e) => setManualDescription(e.target.value)}
              placeholder="Channel description"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isFetchingDetails}
              rows={3}
            />
          </div>
          
          <div className="mb-6">
            <label 
              htmlFor="manualThumbnail" 
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Thumbnail URL
            </label>
            <Input
              id="manualThumbnail"
              value={manualThumbnail}
              onChange={(e) => setManualThumbnail(e.target.value)}
              placeholder="e.g., https://example.com/thumbnail.jpg"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              disabled={isFetchingDetails}
            />
            {manualThumbnail && (
              <div className="mt-2">
                <img 
                  src={manualThumbnail} 
                  alt="Channel thumbnail preview" 
                  className="h-16 w-16 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=YT';
                  }}
                />
              </div>
            )}
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
              disabled={isLoading || isFetchingDetails}
            >
              Back to Auto Add
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !manualChannelId || !manualTitle || isFetchingDetails}
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
