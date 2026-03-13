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
  const [settingsOpen, setSettingsOpen] = useState(false);
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
    <div
      className="absolute inset-0 z-10"
      onMouseEnter={() => setIsContainerHovered(true)}
      onMouseLeave={() => setIsContainerHovered(false)}
    >
      {/* Big center play button when paused and hovering - fade animation */}
      <button
        className={`absolute inset-0 z-20 flex items-center justify-center bg-black/20 transition-all duration-300 ${
          !isPlaying && isContainerHovered
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onTogglePlay}
      >
        <div className={`w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg hover:bg-primary transition-all duration-300 ${
          !isPlaying && isContainerHovered ? "scale-100" : "scale-75"
        }`}>
          <Play className="w-7 h-7 text-white ml-1" fill="white" />
        </div>
      </button>

      {/* Click-to-toggle play on video area (always, both playing and paused) */}
      <button
        className="absolute inset-0 z-15 cursor-default"
        style={{ zIndex: 15 }}
        onClick={onTogglePlay}
      />

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
          isHovering || isContainerHovered || !isPlaying || isDragging
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
            className="absolute inset-y-0 left-0 bg-white/30 rounded-none transition-[width] duration-150"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-none transition-[width] duration-150"
            style={{ width: `${progress}%`, backgroundColor: '#FF0000' }}
          />
          {/* Draggable thumb - outline only, no fill */}
          <div
            className={`absolute top-1/2 w-4 h-4 rounded-full shadow-md bg-transparent transition-transform duration-150 cursor-grab active:cursor-grabbing ${
              isDragging ? "scale-125" : "group-hover:scale-110 scale-100"
            }`}
            style={{
              left: `${progress}%`,
              transform: "translate(-50%, -50%)",
              border: "2.5px solid #FF0000",
            }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center justify-between px-3 py-2">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="text-white transition-colors group/play"
              style={{ }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 fill-current" />
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
                className="transition-colors"
                style={{ color: showVolume ? '#FF0000' : 'white' }}
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
                  className="w-full h-1 cursor-pointer"
                  style={{ accentColor: '#FF0000' }}
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
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <button
                  className="transition-colors"
                  style={{ color: settingsOpen ? '#FF0000' : 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
                  onMouseLeave={(e) => { if (!settingsOpen) e.currentTarget.style.color = 'white'; }}
                >
                  <Settings className="w-4.5 h-4.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="end"
                sideOffset={12}
                className="w-44 p-0 bg-white border border-[#E5E5E5] shadow-xl rounded-xl overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-[#E5E5E5]">
                  <p className="text-xs font-semibold text-[#1A1A1A] tracking-wide">
                    Playback speed
                  </p>
                </div>
                <div className="py-1">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onPlaybackSpeedChange(s)}
                      className={`w-full text-left px-3 py-1.5 text-sm transition-colors flex items-center justify-between ${
                        playbackSpeed === s
                          ? "text-[#FF0000] font-medium bg-[#FFF5F5]"
                          : "text-[#1A1A1A] hover:bg-[#F5F5F5]"
                      }`}
                    >
                      <span>{s === "1" ? "Normal" : `${s}x`}</span>
                      {playbackSpeed === s && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF0000]" />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Fullscreen */}
            <button
              onClick={onFullscreen}
              className="text-white transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
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
    </div>
  );
};
