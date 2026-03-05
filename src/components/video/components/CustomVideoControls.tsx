import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Settings,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  buffered: number;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  playbackSpeed: string;
  onPlaybackSpeedChange: (speed: string) => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const SPEEDS = ["0.25", "0.5", "0.75", "1", "1.25", "1.5", "1.75", "2"];

export const CustomVideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  buffered,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  playbackSpeed,
  onPlaybackSpeedChange,
}: CustomVideoControlsProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [isContainerHovered, setIsContainerHovered] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect || duration === 0) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = x / rect.width;
      onSeek(pct * duration);
    },
    [duration, onSeek]
  );

  const handleProgressDrag = useCallback(
    (e: MouseEvent) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect || duration === 0) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const pct = x / rect.width;
      onSeek(pct * duration);
    },
    [duration, onSeek]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setIsDragging(true);
      handleProgressClick(e);
    },
    [handleProgressClick]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleUp = () => setIsDragging(false);
    window.addEventListener("mousemove", handleProgressDrag);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleProgressDrag);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [isDragging, handleProgressDrag]);

  const VolumeIcon =
    isMuted || volume === 0
      ? VolumeX
      : volume < 50
      ? Volume1
      : Volume2;

  return (
    <>
      {/* Big center play button when paused */}
      {!isPlaying && (
        <button
          className="absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-opacity"
          onClick={onTogglePlay}
        >
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg hover:bg-primary transition-colors">
            <Play className="w-7 h-7 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* Click-to-toggle play on video area */}
      {isPlaying && (
        <button
          className="absolute inset-0 z-15 cursor-default"
          style={{ zIndex: 15 }}
          onClick={onTogglePlay}
        />
      )}

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
          isHovering || !isPlaying || isDragging
            ? "opacity-100"
            : "opacity-0"
        }`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        style={{
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="relative w-full h-1.5 cursor-pointer group hover:h-2.5 transition-all mx-0 mb-0"
          onMouseDown={handleMouseDown}
        >
          {/* Track background */}
          <div className="absolute inset-0 bg-white/20 rounded-none" />
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-none"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Progress */}
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-none"
            style={{ width: `${progress}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-primary rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              left: `${progress}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="text-white hover:text-primary transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" fill="white" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" fill="white" />
              )}
            </button>

            {/* Volume */}
            <div
              className="flex items-center gap-1"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={onToggleMute}
                className="text-white hover:text-primary transition-colors"
              >
                <VolumeIcon className="w-5 h-5" />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  showVolume ? "w-20 opacity-100" : "w-0 opacity-0"
                }`}
              >
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  className="w-full h-1 accent-primary cursor-pointer"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white text-xs font-medium tabular-nums select-none">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Playback speed */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="text-white hover:text-primary transition-colors">
                  <Settings className="w-4.5 h-4.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                className="w-36 p-1 bg-black/90 border-white/10 backdrop-blur-md"
              >
                <p className="text-[10px] text-white/50 uppercase tracking-wider px-2 pt-1 pb-0.5">
                  Speed
                </p>
                {SPEEDS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onPlaybackSpeedChange(s)}
                    className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                      playbackSpeed === s
                        ? "text-primary bg-white/10"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    {s === "1" ? "Normal" : `${s}x`}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Fullscreen */}
            <button
              onClick={onFullscreen}
              className="text-white hover:text-primary transition-colors"
            >
              <Maximize className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hover zone to keep controls visible */}
      <div
        className="absolute bottom-0 left-0 right-0 z-25 h-16 pointer-events-auto"
        style={{ zIndex: 25 }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      />
    </>
  );
};
