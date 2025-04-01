
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlaceholder } from "./VideoPlaceholder";
import { toast } from "sonner";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [fallbackUrl, setFallbackUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackMethod, setPlaybackMethod] = useState<"primary" | "alternate" | "fallback">("primary");
  const navigate = useNavigate();
  const { volume, playbackSpeed } = usePlayback();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fallbackRef = useRef<HTMLIFrameElement>(null);
  const directPlayerRef = useRef<HTMLVideoElement>(null);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const { data: preferences } = useQuery({
    queryKey: ["user-preferences"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching preferences:", error);
        return null;
      }

      return data;
    },
  });

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

  // Add event listener to detect iframe blocking
  useEffect(() => {
    const checkIframeBlocking = () => {
      // Check if iframe is accessible
      if (iframeRef.current) {
        try {
          // Try to access the iframe content - will throw error if blocked
          const iframeWindow = iframeRef.current.contentWindow;
          const iframeDoc = iframeRef.current.contentDocument;
          
          // If we can access iframeWindow and it's null or undefined, iframe might be blocked
          if (!iframeWindow || !iframeDoc) {
            console.warn("Iframe appears to be blocked, switching to alternate method");
            if (playbackMethod === "primary") {
              setPlaybackMethod("alternate");
            } else if (playbackMethod === "alternate") {
              setPlaybackMethod("fallback");
            }
          }
        } catch (e) {
          console.warn("Iframe access error, likely due to security restrictions:", e);
          if (playbackMethod === "primary") {
            setPlaybackMethod("alternate");
          } else if (playbackMethod === "alternate") {
            setPlaybackMethod("fallback");
          }
        }
      }
    };

    // Run check after a short delay to allow iframe to load
    const checkTimer = setTimeout(checkIframeBlocking, 1500);
    
    // Set periodic check to detect delayed blocking
    const periodicCheck = setInterval(checkIframeBlocking, 5000);
    
    return () => {
      clearTimeout(checkTimer);
      clearInterval(periodicCheck);
    };
  }, [playbackMethod, videoId]);

  // Handle iframe load/error events
  const handleIframeLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleIframeError = () => {
    if (retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`Retrying video load, attempt ${retryCount.current}/${maxRetries}`);
      
      // Try refreshing the iframe URL
      if (iframeRef.current) {
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) iframeRef.current.src = currentSrc;
        }, 300);
      }
    } else {
      console.error("Video failed to load after multiple attempts, trying alternate method");
      setPlaybackMethod(prev => prev === "primary" ? "alternate" : "fallback");
      retryCount.current = 0;
    }
  };

  // Add a function to try the direct player as last resort
  const initializeDirectPlayer = () => {
    if (directPlayerRef.current) {
      // Create a direct video source URL - note this won't work for most YouTube videos
      // but is included as a conceptual fallback
      directPlayerRef.current.src = `https://www.youtube.com/watch?v=${videoId}`;
      directPlayerRef.current.controls = true;
      directPlayerRef.current.autoplay = true;
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

  // Advanced technique: create a temporary proxy iframe to bypass filters
  const createProxyPlayer = () => {
    if (!playerContainerRef.current) return;
    
    // Create a wrapper that can potentially bypass some content filters
    try {
      // Create a new iframe element dynamically
      const proxyFrame = document.createElement('iframe');
      proxyFrame.style.width = '100%';
      proxyFrame.style.height = '100%';
      proxyFrame.style.border = 'none';
      proxyFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      proxyFrame.allowFullscreen = true;
      proxyFrame.referrerPolicy = 'origin';
      
      // Set source with minimal tracking parameters
      proxyFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&cc_load_policy=0`;
      
      // Clear container and append new frame
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
        playerContainerRef.current.appendChild(proxyFrame);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error creating proxy player:", error);
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com" && 
          event.origin !== "https://www.youtube-nocookie.com") return;

      try {
        const data = JSON.parse(event.data);
        if (data.event === "onReady") {
          setIsLoading(false);
          const player = (event.source as Window);
          if (player && player.postMessage) {
            player.postMessage(JSON.stringify({
              event: 'command',
              func: 'setVolume',
              args: [volume]
            }), '*');

            player.postMessage(JSON.stringify({
              event: 'command',
              func: 'setPlaybackRate',
              args: [parseFloat(playbackSpeed)]
            }), '*');
          }
        } else if (data.event === "onError") {
          console.error("YouTube player error:", data);
          
          // Try switching to alternate method
          if (playbackMethod === "primary") {
            setPlaybackMethod("alternate");
          } else if (playbackMethod === "alternate") {
            setPlaybackMethod("fallback");
          } else {
            setHasError(true);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error("Error handling YouTube message:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [volume, playbackSpeed, playbackMethod]);

  // Handle playback method changes
  useEffect(() => {
    if (playbackMethod === "fallback") {
      // Last resort: create a proxy player that might bypass some filters
      createProxyPlayer();
    }
  }, [playbackMethod]);

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
      
      {/* Player container for fallback method */}
      <div 
        ref={playerContainerRef} 
        className={`w-full h-full absolute inset-0 ${playbackMethod === "fallback" ? "block" : "hidden"}`}
      ></div>

      {/* Primary YouTube embed */}
      {playbackMethod === "primary" && (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'} z-20`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      )}
      
      {/* Alternate YouTube embed with different parameters */}
      {playbackMethod === "alternate" && (
        <iframe
          ref={fallbackRef}
          src={fallbackUrl}
          className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'} z-20`}
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          loading="eager"
          onLoad={handleIframeLoad}
          onError={handleFallbackError}
        />
      )}
      
      {/* Last resort video element - conceptual only */}
      <video 
        ref={directPlayerRef}
        className="hidden"
        controls
        onError={handleFallbackError}
      />
    </div>
  );
};
