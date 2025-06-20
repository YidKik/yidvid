
import { useEffect } from "react";

interface UseYouTubeMessagesProps {
  volume: number;
  playbackSpeed: string;
  setIsLoading: (loading: boolean) => void;
  setHasError: (error: boolean) => void;
  mountedRef: React.MutableRefObject<boolean>;
}

export const useYouTubeMessages = ({
  volume,
  playbackSpeed,
  setIsLoading,
  setHasError,
  mountedRef
}: UseYouTubeMessagesProps) => {
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
  }, [volume, playbackSpeed, setIsLoading, setHasError, mountedRef]);
};
