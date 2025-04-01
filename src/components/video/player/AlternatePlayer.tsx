
import { useRef, useEffect } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";

interface AlternatePlayerProps {
  fallbackUrl: string;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
  onBlockDetected: () => void;
}

export const AlternatePlayer = ({
  fallbackUrl,
  isLoading,
  onLoad,
  onError,
  onBlockDetected
}: AlternatePlayerProps) => {
  const fallbackRef = useRef<HTMLIFrameElement>(null);
  const { volume, playbackSpeed } = usePlayback();

  // Add event listener to detect iframe blocking, similar to primary player
  useEffect(() => {
    const checkIframeBlocking = () => {
      if (fallbackRef.current) {
        try {
          const iframeWindow = fallbackRef.current.contentWindow;
          const iframeDoc = fallbackRef.current.contentDocument;
          
          if (!iframeWindow || !iframeDoc) {
            console.warn("Alternate iframe appears to be blocked, switching to fallback method");
            onBlockDetected();
          }
        } catch (e) {
          console.warn("Alternate iframe access error:", e);
          onBlockDetected();
        }
      }
    };

    const checkTimer = setTimeout(checkIframeBlocking, 1500);
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
          console.error("Alternate YouTube player error:", data);
          onBlockDetected();
        }
      } catch (error) {
        console.error("Error handling YouTube message in alternate player:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [volume, playbackSpeed, onLoad, onBlockDetected]);

  return (
    <iframe
      ref={fallbackRef}
      src={fallbackUrl}
      className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'} z-20`}
      allowFullScreen
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerPolicy="origin"
      loading="eager"
      onLoad={onLoad}
      onError={onError}
    />
  );
};
