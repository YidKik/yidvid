import { useState, useEffect } from "react";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [embedUrl, setEmbedUrl] = useState("");

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