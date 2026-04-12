import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

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

const SPEEDS = ["0.5", "0.75", "1", "1.25", "1.5", "2"];
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
  const [speedOpen, setSpeedOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [centerFeedback, setCenterFeedback] = useState<"play" | "pause" | null>(null);
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const centerFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useIsMobile();

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = buffered * 100;

  // Close speed popup on outside click
  useEffect(() => {
    if (!speedOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (speedRef.current && !speedRef.current.contains(e.target as Node)) {
        setSpeedOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [speedOpen]);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      if (!speedOpen && !isDragging) {
        setControlsVisible(false);
      }
    }, CONTROLS_HIDE_DELAY);
  }, [speedOpen, isDragging]);

  useEffect(() => {
    if (!isPlaying) {
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    } else {
      resetHideTimer();
    }
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    if (speedOpen) {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      setControlsVisible(true);
    } else if (isPlaying) {
      resetHideTimer();
    }
  }, [speedOpen, isPlaying, resetHideTimer]);

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

  const handleProgressHover = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      setHoverProgress((x / rect.width) * 100);
    },
    []
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

  const showControls = controlsVisible || !isPlaying || isDragging || speedOpen;

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (isPlaying && !speedOpen) setControlsVisible(false);
        setHoverProgress(null);
      }}
    >
      {/* Center feedback icon */}
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

      {/* Big center play button when paused */}
      <button
        className={`absolute inset-0 z-21 flex items-center justify-center bg-black/20 transition-all duration-300 ${
          !isPlaying && showControls && !centerFeedback
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 21 }}
        onClick={handleVideoAreaClick}
      >
        <div className={`${isMobile ? 'w-10 h-10' : 'w-16 h-16'} rounded-full bg-[#FF0000]/90 flex items-center justify-center shadow-lg hover:bg-[#FF0000] transition-all duration-300 ${
          !isPlaying && showControls ? "scale-100" : "scale-75"
        }`}>
          <Play className={`${isMobile ? 'w-4 h-4' : 'w-7 h-7'} text-white ml-0.5`} fill="white" />
        </div>
      </button>

      {/* Click-to-toggle play */}
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
          background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
        }}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className={`relative w-full cursor-pointer group transition-all ${isMobile ? 'h-[5px] hover:h-[7px]' : 'h-[5px] hover:h-[8px]'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleProgressHover}
          onMouseLeave={() => setHoverProgress(null)}
        >
          {/* Background track */}
          <div className="absolute inset-0 bg-white/20 rounded-full" />
          {/* Buffered */}
          <div
            className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Hover preview */}
          {hoverProgress !== null && (
            <div
              className="absolute inset-y-0 left-0 bg-white/15 rounded-full"
              style={{ width: `${hoverProgress}%` }}
            />
          )}
          {/* Played */}
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%`, backgroundColor: '#FF0000' }}
          />
          {/* Thumb */}
          <div
            className={`absolute top-1/2 rounded-full shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing ${
              isDragging ? "scale-125" : "scale-0 group-hover:scale-100"
            }`}
            style={{
              left: `${progress}%`,
              transform: "translate(-50%, -50%)",
              width: isMobile ? '12px' : '14px',
              height: isMobile ? '12px' : '14px',
              backgroundColor: '#FF0000',
            }}
          />
        </div>

        {/* Controls row */}
        <div className={`flex items-center justify-between ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'}`}>
          <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
                resetHideTimer();
              }}
              className="text-white transition-colors hover:text-[#FF0000]"
            >
              {isPlaying ? (
                <Pause className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} fill-current`} />
              ) : (
                <Play className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} ml-0.5 fill-current`} />
              )}
            </button>

            <div
              className="flex items-center gap-1"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
                className="text-white transition-colors hover:text-[#FF0000]"
              >
                <VolumeIcon className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
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

            <span className={`text-white/90 ${isMobile ? 'text-[10px]' : 'text-xs'} font-medium tabular-nums select-none`}>
              {formatTime(currentTime)}
              <span className="text-white/50 mx-0.5">/</span>
              {formatTime(duration)}
            </span>
          </div>

          <div className={`flex items-center ${isMobile ? 'gap-1.5' : 'gap-2'}`}>
            {/* Inline speed selector pill */}
            <div ref={speedRef} className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setSpeedOpen(!speedOpen); }}
                className={`text-white transition-all text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                  speedOpen
                    ? 'border-[#FF0000] text-[#FF0000] bg-[#FF0000]/10'
                    : 'border-white/30 hover:border-white/60'
                }`}
              >
                {playbackSpeed === "1" ? "1x" : `${playbackSpeed}x`}
              </button>

              {/* Speed popup pill */}
              {speedOpen && (
                <div
                  className={`absolute bottom-full mb-2 right-0 flex items-center bg-[#1A1A1A] rounded-full px-1 py-1 shadow-xl border border-white/10 gap-0.5`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEEDS.map((s) => {
                    const isActive = playbackSpeed === s;
                    return (
                      <button
                        key={s}
                        onClick={() => { onPlaybackSpeedChange(s); setSpeedOpen(false); }}
                        className={`relative flex items-center justify-center rounded-full transition-all duration-200 font-semibold ${
                          isMobile ? 'w-8 h-8 text-[10px]' : 'w-9 h-9 text-[11px]'
                        } ${
                          isActive
                            ? 'bg-[#FF0000] text-white shadow-md'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {s === "1" ? "1x" : `${s}x`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
              className="text-white transition-colors hover:text-[#FF0000]"
            >
              <Maximize className={`${isMobile ? 'w-4 h-4' : 'w-4.5 h-4.5'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
