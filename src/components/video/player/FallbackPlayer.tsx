
import { useRef, useEffect } from "react";

interface FallbackPlayerProps {
  videoId: string;
  isLoading: boolean;
  onLoad: () => void;
  onError: () => void;
}

export const FallbackPlayer = ({
  videoId,
  isLoading,
  onLoad,
  onError
}: FallbackPlayerProps) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  // Create a proxy player that might bypass some content filters
  useEffect(() => {
    if (!playerContainerRef.current) return;
    
    try {
      // Create a new iframe element dynamically
      const proxyFrame = document.createElement('iframe');
      proxyFrame.style.width = '100%';
      proxyFrame.style.height = '100%';
      proxyFrame.style.border = 'none';
      proxyFrame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      proxyFrame.allowFullscreen = true;
      proxyFrame.referrerPolicy = 'origin';
      
      // Set source with minimal tracking parameters
      proxyFrame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&cc_load_policy=0`;
      
      // Add load event listener
      proxyFrame.onload = () => {
        onLoad();
      };
      
      proxyFrame.onerror = () => {
        onError();
      };
      
      // Clear container and append new frame
      if (playerContainerRef.current) {
        playerContainerRef.current.innerHTML = '';
        playerContainerRef.current.appendChild(proxyFrame);
      }
    } catch (error) {
      console.error("Error creating proxy player:", error);
      onError();
    }
  }, [videoId, onLoad, onError]);

  return (
    <div 
      ref={playerContainerRef} 
      className={`w-full h-full absolute inset-0 ${isLoading ? 'opacity-30' : 'opacity-100'} z-20`}
    ></div>
  );
};
