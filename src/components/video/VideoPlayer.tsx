import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const navigate = useNavigate();

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

  // Get next video to play
  const { data: nextVideo } = useQuery({
    queryKey: ["next-video", videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("youtube_videos")
        .select("*")
        .neq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.error("Error fetching next video:", error);
        return null;
      }

      return data;
    },
  });

  useEffect(() => {
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
  }, [videoId]);

  // Handle video end event
  const handleMessage = (event: MessageEvent) => {
    if (
      event.origin !== "https://www.youtube.com" ||
      !preferences?.autoplay ||
      !nextVideo
    )
      return;

    try {
      const data = JSON.parse(event.data);
      if (data.event === "onStateChange" && data.info === 0) {
        // Video ended, navigate to next video
        navigate(`/video/${nextVideo.video_id}`);
      }
    } catch (error) {
      console.error("Error parsing YouTube postMessage:", error);
    }
  };

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [nextVideo, preferences]);

  return (
    <div className="aspect-video w-full mb-4 relative">
      <iframe
        src={embedUrl}
        className="w-full h-full absolute inset-0"
        allowFullScreen
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        loading="lazy"
      />
    </div>
  );
};