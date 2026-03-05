
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
      {/* Shield zone: block YouTube top hover bar (title + copy link) */}
      <div
        className="absolute top-0 left-0 right-0 z-10 pointer-events-auto bg-transparent"
        style={{ height: "78px" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Extra shield on top-right where YouTube "Copy link" tends to appear */}
      <div
        className="absolute top-0 right-0 z-10 pointer-events-auto bg-transparent"
        style={{ height: "92px", width: "220px" }}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Shield zone: block bottom-right YouTube branding/logo without touching controls */}
      <div
        className="absolute z-10 pointer-events-auto bg-transparent"
        style={{ bottom: "34px", right: "0", height: "78px", width: "180px" }}
        onClick={(e) => e.stopPropagation()}
      />
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
