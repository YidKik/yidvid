import { useState, useRef, useCallback, useEffect } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlayerError } from "./components/VideoPlayerError";
import { CustomVideoControls } from "./components/CustomVideoControls";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";
import yvPlayerLogo from "@/assets/yv-player-logo.png";

interface VideoPlayerProps {
  videoId: string;
  onVideoEnd?: () => void;
}

export const VideoPlayer = ({ videoId, onVideoEnd }: VideoPlayerProps) => {
  const [hasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { playbackSpeed, setPlaybackSpeed } = usePlayback();
  const containerRef = useRef<HTMLDivElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const player = useYouTubePlayer(playerContainerRef, videoId, onVideoEnd);

  // Keep an opaque cover over the iframe until playback actually starts so the
  // native YouTube poster / play button / info chip never flashes through.
  const [hasStarted, setHasStarted] = useState(false);
  useEffect(() => {
    setHasStarted(false);
  }, [videoId]);
  useEffect(() => {
    if (player.isPlaying) setHasStarted(true);
  }, [player.isPlaying]);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

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
      className="aspect-video w-full relative overflow-hidden bg-black group"
    >
      {/* YouTube player — oversized to crop native YT overlays that flash during state changes */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          ref={playerContainerRef}
          className="absolute pointer-events-none [&_iframe]:!w-full [&_iframe]:!h-full"
          style={{
            top: '-60px',
            left: '-2px',
            right: '-2px',
            bottom: '-50px',
            width: 'calc(100% + 4px)',
            height: 'calc(100% + 110px)',
          }}
        />
      </div>
      {/* Pre-roll cover — hides YouTube's own poster UI before playback starts */}
      {!hasStarted && (
        <div className="absolute inset-0 z-[6] bg-black pointer-events-none" />
      )}
      {/* Top scrim + YidVid mark — masks YouTube's info chip and brands the frame */}
      <div
        className="absolute top-0 left-0 right-0 z-[7] pointer-events-none"
        style={{
          height: 64,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.65) 45%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-0 left-0 z-[8] pointer-events-none flex items-center pl-3"
        style={{
          height: 52,
          width: 150,
          background:
            'linear-gradient(to right, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)',
        }}
      >
        <img
          src={yvPlayerLogo}
          alt=""
          aria-hidden
          className="w-8 md:w-10 h-auto opacity-90"
        />
      </div>
      {/* Opaque masks to guarantee YT overlays are hidden even during buffering flashes */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-black z-[5]" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black z-[5]" />
      <CustomVideoControls
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        buffered={player.buffered}
        isBuffering={player.isBuffering || (!hasStarted && !player.isReady)}
        isFullscreen={isFullscreen}
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
