
import { useState, useEffect, useRef, useCallback } from "react";
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
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { volume, playbackSpeed } = usePlayback();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const mountedRef = useRef(true);

  // Memoize URL creation to prevent unnecessary re-renders
  const createEmbedUrl = useCallback((videoId: string) => {
    const baseUrl = `https://www.youtube-nocookie.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: "1",
      rel: "0",
      modestbranding: "1",
      enablejsapi: "1",
      origin: window.location.origin,
    });
    return `${baseUrl}?${params.toString()}`;
  }, []);

  // Single effect to handle video ID changes
  useEffect(() => {
    if (!videoId) return;
    
    mountedRef.current = true;
    setHasError(false);
    setIsLoading(true);
    
    const url = createEmbedUrl(videoId);
    setEmbedUrl(url);
    
    // Set loading to false after a short delay to allow iframe to initialize
    const timer = setTimeout(() => {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }, 1000);

    return () => {
      clearTimeout(timer);
      mountedRef.current = false;
    };
  }, [videoId, createEmbedUrl]);

  // Handle YouTube player messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com" && 
          event.origin !== "https://www.youtube-nocookie.com") return;

      try {
        const data = JSON.parse(event.data);
        if (!mountedRef.current) return;

        if (data.event === "onReady") {
          setIsLoading(false);
          const player = (event.source as Window);
          if (player?.postMessage) {
            // Set volume and playback speed
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
          if (mountedRef.current) {
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
  }, [volume, playbackSpeed]);

  // Handle iframe load events
  const handleIframeLoad = useCallback(() => {
    if (mountedRef.current) {
      setIsLoading(false);
      setHasError(false);
    }
  }, []);

  const handleIframeError = useCallback(() => {
    if (mountedRef.current) {
      console.error("Iframe failed to load");
      setHasError(true);
      setIsLoading(false);
      toast.error("Video failed to load", {
        description: "Please try refreshing the page",
      });
    }
  }, []);

  if (hasError) {
    return (
      <div className="aspect-video w-full mb-4 relative">
        <VideoPlaceholder size="large" />
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <button 
            onClick={() => navigate("/videos")}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Return to Videos
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
      
      {embedUrl && (
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
        />
      )}
    </div>
  );
};
