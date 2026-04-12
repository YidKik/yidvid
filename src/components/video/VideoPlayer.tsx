import { useState, useRef, useCallback } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlayerError } from "./components/VideoPlayerError";
import { CustomVideoControls } from "./components/CustomVideoControls";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";

interface VideoPlayerProps {
  videoId: string;
  onVideoEnd?: () => void;
}

export const VideoPlayer = ({ videoId, onVideoEnd }: VideoPlayerProps) => {
  const [hasError, setHasError] = useState(false);
  const { playbackSpeed, setPlaybackSpeed } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const player = useYouTubePlayer(playerContainerRef, videoId, onVideoEnd);

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
      {/* YouTube player renders here via the API */}
      <div
        ref={playerContainerRef}
        className="absolute inset-0 w-full h-full pointer-events-none [&_iframe]:!w-full [&_iframe]:!h-full"
      />
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
    </div>
  );
};
