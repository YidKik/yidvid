
import { useState, useCallback, useEffect, useRef } from "react";

export const useEmbedUrl = (videoId: string) => {
  const [embedUrl, setEmbedUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
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
      iv_load_policy: "3",
      cc_load_policy: "0",
      disablekb: "1",
      playsinline: "1",
      fs: "1",
      color: "white",
      showinfo: "0",
      controls: "1",
    });
    return `${baseUrl}?${params.toString()}`;
  }, []);

  // Single effect to handle video ID changes
  useEffect(() => {
    if (!videoId) return;
    
    mountedRef.current = true;
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

  return {
    embedUrl,
    isLoading,
    setIsLoading,
    mountedRef
  };
};
