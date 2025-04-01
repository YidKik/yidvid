
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { VideoPlaceholder } from "../VideoPlaceholder";
import { PrimaryPlayer } from "./PrimaryPlayer";
import { AlternatePlayer } from "./AlternatePlayer";
import { FallbackPlayer } from "./FallbackPlayer";

interface PlayerContainerProps {
  videoId: string;
}

export const PlayerContainer = ({ videoId }: PlayerContainerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackMethod, setPlaybackMethod] = useState<"primary" | "alternate" | "fallback">("primary");
  const navigate = useNavigate();
  const retryCount = { current: 0 };
  const maxRetries = 3;

  // Create a function to set up multiple URL formats
  const setupVideoUrls = () => {
    try {
      // Primary embed URL with standard parameters
      const baseUrl = `https://www.youtube.com/embed/${videoId}`;
      const primaryParams = new URLSearchParams({
        autoplay: "1",
        rel: "0",
        modestbranding: "1",
        enablejsapi: "1",
        origin: window.location.origin,
        widget_referrer: window.location.href,
      });
      
      // Alternative embed URL with different parameters to avoid some filters
      const alternateParams = new URLSearchParams({
        autoplay: "1",
        controls: "1",
        showinfo: "0",
        iv_load_policy: "3", // Hide annotations
        fs: "1", // Allow fullscreen
        cc_load_policy: "0", // Hide closed captions by default
        hl: "en", // Set interface language
      });
      
      // Set both URLs
      setEmbedUrl(`${baseUrl}?${primaryParams.toString()}`);
      setFallbackUrl(`${baseUrl}?${alternateParams.toString()}`);
    } catch (error) {
      console.error("Error creating embed URLs:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  // Reset component state when videoId changes (navigation)
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    setPlaybackMethod("primary");
    retryCount.current = 0;
    
    setupVideoUrls();
  }, [videoId]);

  // Handle iframe load/error events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`Retrying video load, attempt ${retryCount.current}/${maxRetries}`);
      
      // Try alternate method after failures
      if (retryCount.current >= 2) {
        setPlaybackMethod(prev => prev === "primary" ? "alternate" : "fallback");
      }
      
      return true; // Indicate that we're still retrying
    } else {
      console.error("Video failed to load after multiple attempts, trying alternate method");
      setPlaybackMethod(prev => prev === "primary" ? "alternate" : "fallback");
      retryCount.current = 0;
      return false; // Indicate that we're giving up on this method
    }
  };

  // Handle error in fallback player
  const handleFallbackError = () => {
    console.error("Fallback player also failed");
    setHasError(true);
    setIsLoading(false);
    
    // Notify user
    toast.error("Video playback is currently unavailable", {
      description: "Please try a different video or try again later",
      action: {
        label: "Try Again",
        onClick: () => window.location.reload(),
      },
    });
  };

  const switchToAlternatePlayer = () => {
    setPlaybackMethod("alternate");
  };

  const switchToFallbackPlayer = () => {
    setPlaybackMethod("fallback");
  };

  if (hasError) {
    return (
      <div className="aspect-video w-full mb-4 relative">
        <VideoPlaceholder size="large" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button 
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full mb-4 relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100/30 z-10">
          <VideoPlaceholder size="medium" />
        </div>
      )}
      
      {/* Render the appropriate player based on playback method */}
      {playbackMethod === "primary" && (
        <PrimaryPlayer
          embedUrl={embedUrl}
          isLoading={isLoading}
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          onBlockDetected={switchToAlternatePlayer}
        />
      )}
      
      {playbackMethod === "alternate" && (
        <AlternatePlayer
          fallbackUrl={fallbackUrl}
          isLoading={isLoading}
          onLoad={handleIframeLoad}
          onError={handleFallbackError}
          onBlockDetected={switchToFallbackPlayer}
        />
      )}
      
      {playbackMethod === "fallback" && (
        <FallbackPlayer
          videoId={videoId}
          isLoading={isLoading}
          onLoad={handleIframeLoad}
          onError={handleFallbackError}
        />
      )}
    </div>
  );
};
