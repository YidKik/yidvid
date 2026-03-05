import { useState, useRef, useCallback } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlayerError } from "./components/VideoPlayerError";
import { VideoPlayerLoading } from "./components/VideoPlayerLoading";
import { VideoPlayerIframe } from "./components/VideoPlayerIframe";
import { CustomVideoControls } from "./components/CustomVideoControls";
import { useEmbedUrl } from "./hooks/useEmbedUrl";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";

interface VideoPlayerProps {
  videoId: string;
  onVideoEnd?: () => void;
}

export const VideoPlayer = ({ videoId, onVideoEnd }: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const { playbackSpeed, setPlaybackSpeed } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const { embedUrl, isLoading, setIsLoading, mountedRef } = useEmbedUrl(videoId);

  const player = useYouTubePlayer(iframeRef, onVideoEnd);

  const handleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen();
    }
  }, []);

  const handlePlaybackSpeedChange = useCallback(
    (speed: string) => {
      setPlaybackSpeed(speed);
      player.setPlaybackRate(parseFloat(speed));
    },
    [setPlaybackSpeed, player]
  );

  if (hasError) {
    return <VideoPlayerError />;
  }

  return (
    <div
      ref={containerRef}
      className="aspect-video w-full mb-4 relative rounded-lg overflow-hidden bg-black group"
    >
      <VideoPlayerLoading isLoading={isLoading} />
      <VideoPlayerIframe
        ref={iframeRef}
        embedUrl={embedUrl}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        setHasError={setHasError}
        mountedRef={mountedRef}
      />
      {!isLoading && (
        <CustomVideoControls
          isPlaying={player.isPlaying}
          currentTime={player.currentTime}
          duration={player.duration}
          volume={player.volume}
          isMuted={player.isMuted}
          buffered={player.buffered}
          onTogglePlay={player.togglePlay}
          onSeek={player.seek}
          onVolumeChange={player.setVolume}
          onToggleMute={player.toggleMute}
          onFullscreen={handleFullscreen}
          playbackSpeed={playbackSpeed}
          onPlaybackSpeedChange={handlePlaybackSpeedChange}
        />
      )}
    </div>
  );
};
