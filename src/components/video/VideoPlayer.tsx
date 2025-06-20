
import { useState } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlaceholder } from "./VideoPlaceholder";
import { VideoPlayerError } from "./components/VideoPlayerError";
import { VideoPlayerLoading } from "./components/VideoPlayerLoading";
import { VideoPlayerIframe } from "./components/VideoPlayerIframe";
import { useEmbedUrl } from "./hooks/useEmbedUrl";
import { useYouTubeMessages } from "./hooks/useYouTubeMessages";

interface VideoPlayerProps {
  videoId: string;
}

export const VideoPlayer = ({ videoId }: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const { volume, playbackSpeed } = usePlayback();
  
  const { embedUrl, isLoading, setIsLoading, mountedRef } = useEmbedUrl(videoId);

  useYouTubeMessages({
    volume,
    playbackSpeed,
    setIsLoading,
    setHasError,
    mountedRef
  });

  if (hasError) {
    return <VideoPlayerError />;
  }

  return (
    <div className="aspect-video w-full mb-4 relative">
      <VideoPlayerLoading isLoading={isLoading} />
      <VideoPlayerIframe
        embedUrl={embedUrl}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setHasError={setHasError}
        mountedRef={mountedRef}
      />
    </div>
  );
};
