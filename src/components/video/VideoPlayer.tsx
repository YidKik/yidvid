
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlayback } from "@/contexts/PlaybackContext";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();
  const { volume, playbackSpeed } = usePlayback();

  // Get user's autoplay preference
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

  useEffect(() => {
    try {
      // Create a more permissive embed URL with additional parameters
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
    }
  }, [videoId]);

  // Handle messages from the YouTube iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;

      try {
        const data = JSON.parse(event.data);
        if (data.event === "onReady") {
          // Set initial volume and playback speed when the player is ready
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
      <div className="aspect-video w-full mb-4 relative bg-[#9e9e9e] flex items-center justify-center rounded-lg overflow-hidden">
        <img 
          src="/lovable-uploads/42b6bf6a-9833-47de-ae22-5c9e183e66d0.png" 
          alt="Video unavailable" 
          className="h-16 w-auto"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video w-full mb-4 relative">
      <iframe
        src={embedUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
