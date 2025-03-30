
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlaceholder } from "./VideoPlaceholder";

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
  const retryCount = useRef(0);
  const maxRetries = 2;

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

  // Reset component state when videoId changes (navigation)
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
    retryCount.current = 0;
    
    try {
      const baseUrl = `https://www.youtube.com/embed/${videoId}`;
      const params = new URLSearchParams({
        autoplay: "1",
        rel: "0",
        modestbranding: "1",
        enablejsapi: "1",
        origin: window.location.origin,
        widget_referrer: window.location.href,
      });

      setEmbedUrl(`${baseUrl}?${params.toString()}`);
    } catch (error) {
      console.error("Error creating embed URL:", error);
      setHasError(true);
      setIsLoading(false);
    }
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
      
      // Try refreshing the iframe URL
      if (iframeRef.current) {
        const currentSrc = iframeRef.current.src;
        iframeRef.current.src = '';
        setTimeout(() => {
          if (iframeRef.current) iframeRef.current.src = currentSrc;
        }, 300);
      }
    } else {
      console.error("Video failed to load after multiple attempts");
      setHasError(true);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

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
          setHasError(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error handling YouTube message:", error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [volume, playbackSpeed]);

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
      
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className={`w-full h-full absolute inset-0 transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
      />
    </div>
  );
};
