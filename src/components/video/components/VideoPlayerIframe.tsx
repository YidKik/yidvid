
import { useCallback, useRef } from "react";
import { toast } from "sonner";

interface VideoPlayerIframeProps {
  embedUrl: string;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  setHasError: (error: boolean) => void;
  mountedRef: React.MutableRefObject<boolean>;
}

export const VideoPlayerIframe = ({
  embedUrl,
  isLoading,
  setIsLoading,
  setHasError,
  mountedRef
}: VideoPlayerIframeProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Handle iframe load events
  const handleIframeLoad = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      setHasError(false);
    }
  }, [setIsLoading, setHasError, mountedRef]);

  const handleIframeError = useCallback(() => {
    if (mountedRef.current) {
      console.error("Iframe failed to load");
      setHasError(true);
      setIsLoading(false);
      toast.error("Video failed to load", {
        description: "Please try refreshing the page",
      });
    }
  }, [setIsLoading, setHasError, mountedRef]);

  if (!embedUrl) return null;

  return (
    <>
      <style>{`
        /* Hide YouTube logo and related videos overlay */
        .ytp-pause-overlay,
        .ytp-scroll-min,
        .ytp-player-content,
        .ytp-endscreen-content,
        .ytp-ce-element,
        .ytp-cards-teaser,
        .ytp-watermark,
        .ytp-chrome-top-buttons,
        .ytp-show-cards-title {
          display: none !important;
          pointer-events: none !important;
        }
        
        /* Prevent clicks on YouTube branding */
        iframe[src*="youtube"] {
          pointer-events: auto;
        }
        
        iframe[src*="youtube"] .ytp-title-link,
        iframe[src*="youtube"] .ytp-youtube-button {
          pointer-events: none !important;
          display: none !important;
        }
      `}</style>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${
          isLoading ? 'opacity-30' : 'opacity-100'
        }`}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        title="Video Player"
      />
    </>
  );
};
