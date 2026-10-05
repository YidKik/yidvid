import { useState, useRef, useCallback, useEffect } from "react";
import { usePlayback } from "@/contexts/PlaybackContext";
import { VideoPlayerError } from "./components/VideoPlayerError";
import { CustomVideoControls } from "./components/CustomVideoControls";
import { useYouTubePlayer } from "./hooks/useYouTubePlayer";


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

  // Stall detection: if playback hasn't started within 15s, offer play/retry instead of an endless spinner
  const [isStalled, setIsStalled] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setIsStalled(false);
    if (hasStarted || player.errorCode !== null) return;
    const t = setTimeout(() => setIsStalled(true), 15000);
    return () => clearTimeout(t);
  }, [videoId, hasStarted, player.errorCode, attempt]);

  const handleRetry = useCallback(() => {
    setHasStarted(false);
    setIsStalled(false);
    setAttempt((a) => a + 1);
    player.retry();
  }, [player]);

  const errorMessage =
    player.errorCode === 101 || player.errorCode === 150
      ? "The video owner doesn't allow this video to play outside YouTube."
      : player.errorCode === 100
      ? "This video is unavailable or has been removed."
      : player.errorCode === 2
      ? "This video link looks invalid."
      : player.errorCode !== null
      ? "The video couldn't be loaded. Check your connection and try again."
      : isStalled
      ? "The video is taking longer than usual to load."
      : null;

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
      {/* Top scrim — even fade that masks YouTube's info chip, lighter when idle */}
      <div
        className="absolute top-0 left-0 right-0 z-[7] pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          height: 64,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.55) 50%, transparent 100%)',
        }}
      />
      {/* Opaque masks to guarantee YT overlays are hidden even during buffering flashes */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-black z-[5]" />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black z-[5]" />
      {errorMessage && (
        <div
          role="alert"
          className="absolute inset-0 z-[40] flex flex-col items-center justify-center gap-3 bg-black px-6 text-center"
        >
          <p className="text-sm sm:text-base font-semibold text-white max-w-md">{errorMessage}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {isStalled && player.errorCode === null && player.isReady && (
              <button
                type="button"
                onClick={() => { setIsStalled(false); player.play(); }}
                className="rounded-full bg-[#FFCC00] px-4 py-2 text-sm font-semibold text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Play
              </button>
            )}
            {player.errorCode !== 101 && player.errorCode !== 150 && player.errorCode !== 100 && (
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-full bg-[#FF0000] px-4 py-2 text-sm font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Retry
              </button>
            )}
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFCC00]"
            >
              Open on YouTube
            </a>
          </div>
        </div>
      )}
      <CustomVideoControls
        showPlayBadge={hasStarted}
        isPlaying={player.isPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        volume={player.volume}
        isMuted={player.isMuted}
        buffered={player.buffered}
        isBuffering={!errorMessage && (player.isBuffering || (!hasStarted && !player.isReady))}
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
