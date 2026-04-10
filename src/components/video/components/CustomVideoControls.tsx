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
import { useIsMobile } from "@/hooks/use-mobile";
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
const CONTROLS_HIDE_DELAY = 2500;

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
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [centerFeedback, setCenterFeedback] = useState<"play" | "pause" | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile } = useIsMobile();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  // Auto-hide controls after inactivity
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      if (!settingsOpen && !isDragging) {
        setControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, [settingsOpen, isDragging]);

  // Show controls when not playing, reset timer on play state change
  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
  }, [isPlaying, resetHideTimer]);

  // Keep controls visible when settings menu is open
  useEffect(() => {
    if (settingsOpen) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
    } else if (isPlaying) {
      resetHideTimer();
    }
  }, [settingsOpen, isPlaying, resetHideTimer]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (centerFeedbackTimerRef.current) clearTimeout(centerFeedbackTimerRef.current);
    };
  }, []);

  const triggerCenterFeedback = useCallback((type: "play" | "pause") => {
    if (centerFeedbackTimerRef.current) clearTimeout(centerFeedbackTimerRef.current);
    setCenterFeedback(type);
    centerFeedbackTimerRef.current = setTimeout(() => {
      setCenterFeedback(null);
    }, 700);
  }, []);

  const handleVideoAreaClick = useCallback(() => {
    // Show feedback based on what will happen (toggle)
    triggerCenterFeedback(isPlaying ? "pause" : "play");
    onTogglePlay();
    resetHideTimer();
  }, [isPlaying, onTogglePlay, triggerCenterFeedback, resetHideTimer]);

  const handleMouseMove = useCallback(() => {
    resetHideTimer();
  }, [resetHideTimer]);

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

  const showControls = controlsVisible || !isPlaying || isDragging || settingsOpen;

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying && !settingsOpen) setControlsVisible(false);
      }}
    >
      {/* Center feedback icon (transient play/pause indicator) */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-opacity duration-500 ${
          centerFeedback ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className={`${isMobile ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-black/50 flex items-center justify-center`}>
          {centerFeedback === "pause" ? (
            <Pause className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-white`} fill="white" />
          ) : (
            <Play className={`${isMobile ? 'w-5 h-5' : 'w-7 h-7'} text-white ml-0.5`} fill="white" />
          )}
        </div>
      </div>

      {/* Big center play button when paused and controls visible */}
      <button
        className={`absolute inset-0 z-21 flex items-center justify-center bg-black/20 transition-all duration-300 ${
          !isPlaying && showControls && !centerFeedback
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 21 }}
        onClick={handleVideoAreaClick}
      >
        <div className={`${isMobile ? 'w-10 h-10' : 'w-16 h-16'} rounded-full bg-primary/90 flex items-center justify-center shadow-lg hover:bg-primary transition-all duration-300 ${
          !isPlaying && showControls ? "scale-100" : "scale-75"
        }`}>
          <Play className={`${isMobile ? 'w-4 h-4' : 'w-7 h-7'} text-white ml-0.5`} fill="white" />
        </div>
      </button>

      {/* Click-to-toggle play on video area (always active) */}
      <button
        className="absolute inset-0 cursor-default"
        style={{ zIndex: 15 }}
        onClick={handleVideoAreaClick}
      />

      {/* Bottom controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
        }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className={`relative w-full ${isMobile ? 'h-1' : 'h-1.5'} cursor-pointer group ${isMobile ? 'hover:h-1.5' : 'hover:h-2.5'} transition-all mx-0 mb-0`}
          onMouseDown={handleMouseDown}
        >
          <div className="absolute inset-0 bg-white/20 rounded-none" />
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-none transition-[width] duration-150"
            style={{ width: `${bufferedPercent}%` }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-none transition-[width] duration-150"
            style={{ width: `${progress}%`, backgroundColor: '#FF0000' }}
          />
          <div
            className={`absolute top-1/2 ${isMobile ? 'w-2.5 h-2.5' : 'w-4 h-4'} rounded-full shadow-md bg-transparent transition-transform duration-150 cursor-grab active:cursor-grabbing ${
              isDragging ? "scale-125" : "group-hover:scale-110 scale-100"
            }`}
            style={{
              left: `${progress}%`,
              transform: "translate(-50%, -50%)",
              border: `${isMobile ? '2px' : '2.5px'} solid #FF0000`,
            }}
          />
        </div>

        {/* Controls row */}
        <div className={`flex items-center justify-between ${isMobile ? 'px-2 py-1' : 'px-3 py-2'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
                resetHideTimer();
              }}
              className="text-white transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              {isPlaying ? (
                <Pause className={`${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'} fill-current`} />
              ) : (
                <Play className={`${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'} ml-0.5 fill-current`} />
              )}
            </button>

            <div
              className="flex items-center gap-1"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                className="transition-colors"
                style={{ color: showVolume ? '#FF0000' : 'white' }}
              >
                <VolumeIcon className={`${isMobile ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  showVolume ? `${isMobile ? 'w-14' : 'w-20'} opacity-100` : "w-0 opacity-0"
                }`}
              >
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 cursor-pointer"
                  style={{ accentColor: '#FF0000' }}
                />
              </div>
            </div>

            <span className={`text-white ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium tabular-nums select-none`}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
            <Popover open={settingsOpen} onOpenChange={setSettingsOpen}>
              <PopoverTrigger asChild>
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="transition-colors"
                  style={{ color: settingsOpen ? '#FF0000' : 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
                  onMouseLeave={(e) => { if (!settingsOpen) e.currentTarget.style.color = 'white'; }}
                >
                  <Settings className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'}`} />
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

            <button
              onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
              className="text-white transition-colors"
              onMouseEnter={(e) => e.currentTarget.style.color = '#FF0000'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'white'}
            >
              <Maximize className={`${isMobile ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
