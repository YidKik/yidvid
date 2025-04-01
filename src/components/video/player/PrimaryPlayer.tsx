
import { useRef, useEffect } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";

interface PrimaryPlayerProps {
  embedUrl: string;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => boolean; // Returns true if should retry, false otherwise
  onBlockDetected: () => void;
}

export const PrimaryPlayer = ({
  embedUrl,
  isLoading,
  onLoad,
  onError,
  onBlockDetected
}: PrimaryPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { volume, playbackSpeed } = usePlayback();

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
            onBlockDetected();
          }
        } catch (e) {
          console.warn("Iframe access error, likely due to security restrictions:", e);
          onBlockDetected();
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
  }, [onBlockDetected]);

  // Handle YouTube postMessage communication
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com" && 
          event.origin !== "https://www.youtube-nocookie.com") return;

      try {
        const data = JSON.parse(event.data);
        if (data.event === "onReady") {
          onLoad();
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
          
          // Try switching to alternate method if error handling suggests giving up
          if (!onError()) {
            onBlockDetected();
          }
        }
      } catch (error) {
        console.error("Error handling YouTube message:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [volume, playbackSpeed, onLoad, onError, onBlockDetected]);

  // Handle iframe error with refresh attempt
  const handleIframeError = () => {
    const shouldRetry = onError();
    
    if (shouldRetry && iframeRef.current) {
      // Try refreshing the iframe URL
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = currentSrc;
      }, 300);
    }
  };

  return (
    <iframe
      ref={iframeRef}
      src={embedUrl}
      className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'} z-20`}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="strict-origin-when-cross-origin"
      loading="lazy"
      onLoad={onLoad}
      onError={handleIframeError}
    />
  );
};
