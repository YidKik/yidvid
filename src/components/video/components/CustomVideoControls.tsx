import { useState, useCallback, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface CustomVideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  buffered: number;
  isBuffering?: boolean;
  isFullscreen?: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
  playbackSpeed: string;
  onPlaybackSpeedChange: (speed: string) => void;
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const SPEEDS = ["0.5", "0.75", "1", "1.25", "1.5", "2"];
const CONTROLS_HIDE_DELAY = 2600;
const ACCENT = "#FFCC00";

export const CustomVideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  buffered,
  isBuffering = false,
  isFullscreen = false,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  playbackSpeed,
  onPlaybackSpeedChange,
}: CustomVideoControlsProps) => {
  const [scrubTime, setScrubTime] = useState<number | null>(null);
  const [showVolume, setShowVolume] = useState(false);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [hoverTime, setHoverTime] = useState(0);

  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const speedRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const { isMobile } = useIsMobile();

  const isDragging = scrubTime !== null;
  const displayTime = scrubTime ?? currentTime;
  const progress = duration > 0 ? (displayTime / duration) * 100 : 0;
  const bufferedPercent = Math.min(100, buffered * 100);

  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setControlsVisible(true);
    hideTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, CONTROLS_HIDE_DELAY);
  }, []);

  // Keyboard shortcuts: space / k play-pause, arrows seek, m mute, f fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable
      ) {
        return;
      }
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          onTogglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          onSeek(Math.min(duration, currentTime + 10));
          break;
        case "ArrowLeft":
          e.preventDefault();
          onSeek(Math.max(0, currentTime - 10));
          break;
        case "KeyM":
          onToggleMute();
          break;
        case "KeyF":
          onFullscreen();
          break;
        default:
          return;
      }
      resetHideTimer();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    onTogglePlay,
    onSeek,
    onToggleMute,
    onFullscreen,
    currentTime,
    duration,
    resetHideTimer,
  ]);

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

  useEffect(() => {
    if (isPlaying) resetHideTimer();
    else if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  }, [isPlaying, resetHideTimer]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  const timeFromClientX = useCallback(
    (clientX: number) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || duration === 0) return 0;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      return (x / rect.width) * duration;
    },
    [duration]
  );

  // Pointer-based scrubbing (works for mouse, touch and pen)
  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (duration === 0) return;
      e.preventDefault();
      e.stopPropagation();
      draggingRef.current = true;
      progressRef.current?.setPointerCapture(e.pointerId);
      setScrubTime(timeFromClientX(e.clientX));
      setControlsVisible(true);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    },
    [duration, timeFromClientX]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = progressRef.current?.getBoundingClientRect();
      if (rect) {
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        setHoverX(x);
        setHoverTime(timeFromClientX(e.clientX));
      }
      if (!draggingRef.current) return;
      setScrubTime(timeFromClientX(e.clientX));
    },
    [timeFromClientX]
  );

  const endScrub = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      try {
        progressRef.current?.releasePointerCapture(e.pointerId);
      } catch {}
      const target = timeFromClientX(e.clientX);
      setScrubTime(null);
      onSeek(target);
      if (isPlaying) resetHideTimer();
    },
    [timeFromClientX, onSeek, isPlaying, resetHideTimer]
  );

  const handleSurfaceClick = useCallback(() => {
    onTogglePlay();
    resetHideTimer();
  }, [onTogglePlay, resetHideTimer]);

  const skip = useCallback(
    (delta: number) => {
      onSeek(Math.max(0, Math.min(duration || 0, currentTime + delta)));
      resetHideTimer();
    },
    [onSeek, currentTime, duration, resetHideTimer]
  );

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  const showControls = controlsVisible || !isPlaying || isDragging || speedOpen;
  const iconBtn =
    "flex items-center justify-center rounded-full text-white/90 hover:text-[#FFCC00] hover:bg-white/10 transition-colors";
  const btnSize = isMobile ? "w-8 h-8" : "w-9 h-9";
  const iconSize = isMobile ? "w-4 h-4" : "w-[18px] h-[18px]";

  return (
    <div
      className="absolute inset-0 z-10"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => {
        if (isPlaying && !speedOpen && !isDragging) setControlsVisible(false);
        setHoverX(null);
      }}
    >
      {/* Tap / click surface — single source of play-pause on the video itself */}
      <button
        aria-label={isPlaying ? "Pause" : "Play"}
        className="absolute inset-0 cursor-default"
        style={{ zIndex: 15 }}
        onClick={handleSurfaceClick}
      />

      {/* Buffering spinner */}
      {isBuffering && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div
            className={`${isMobile ? "w-9 h-9" : "w-12 h-12"} rounded-full border-2 border-white/20 animate-spin`}
            style={{ borderTopColor: ACCENT }}
          />
        </div>
      )}

      {/* Single centered play badge — only while paused */}
      <div
        className={`absolute inset-0 z-20 flex items-center justify-center pointer-events-none transition-all duration-200 ${
          !isPlaying && !isBuffering
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90"
        }`}
      >
        <div
          className={`${isMobile ? "w-14 h-14" : "w-[72px] h-[72px]"} rounded-full flex items-center justify-center`}
          style={{
            backgroundColor: ACCENT,
            boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
          }}
        >
          <Play
            className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-[#1A1A1A] ml-1`}
            fill="#1A1A1A"
          />
        </div>
      </div>

      {/* Bottom control bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 transition-all duration-200 ${
          showControls
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 55%, transparent 100%)",
          paddingTop: isMobile ? 24 : 36,
        }}
      >
        {/* Scrubber */}
        <div className={`${isMobile ? "px-2.5" : "px-4"} pb-0.5`}>
          <div
            ref={progressRef}
            className="relative w-full cursor-pointer group py-2 touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endScrub}
            onPointerCancel={endScrub}
            onMouseLeave={() => setHoverX(null)}
          >
            {/* Track */}
            <div
              className={`relative w-full rounded-full bg-white/25 transition-all duration-150 ${
                isDragging ? "h-[6px]" : "h-[4px] group-hover:h-[6px]"
              }`}
            >
              <div
                className="absolute inset-y-0 left-0 bg-white/30 rounded-full"
                style={{ width: `${bufferedPercent}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: ACCENT,
                  transition: isDragging ? "none" : "width 200ms linear",
                }}
              />
              {/* Handle */}
              <div
                className={`absolute top-1/2 rounded-full transition-transform duration-150 ${
                  isDragging ? "scale-110" : "scale-0 group-hover:scale-100"
                }`}
                style={{
                  left: `${progress}%`,
                  transform: "translate(-50%, -50%)",
                  width: isMobile ? 14 : 15,
                  height: isMobile ? 14 : 15,
                  backgroundColor: ACCENT,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              />
            </div>

            {/* Hover / drag timestamp bubble */}
            {!isMobile && (hoverX !== null || isDragging) && duration > 0 && (
              <div
                className="absolute -top-6 px-2 py-0.5 rounded-md bg-[#1A1A1A]/95 text-white text-[11px] font-semibold tabular-nums pointer-events-none border border-white/10"
                style={{
                  left: isDragging
                    ? `${progress}%`
                    : `${hoverX}px`,
                  transform: "translateX(-50%)",
                }}
              >
                {formatTime(isDragging ? displayTime : hoverTime)}
              </div>
            )}
          </div>
        </div>

        {/* Buttons row */}
        <div
          className={`flex items-center justify-between ${
            isMobile ? "px-1.5 pb-1.5" : "px-3 pb-2.5"
          }`}
        >
          <div className={`flex items-center ${isMobile ? "gap-0.5" : "gap-1"}`}>
            <button
              aria-label={isPlaying ? "Pause" : "Play"}
              onClick={(e) => {
                e.stopPropagation();
                onTogglePlay();
                resetHideTimer();
              }}
              className={`${iconBtn} ${btnSize}`}
            >
              {isPlaying ? (
                <Pause className={`${iconSize} fill-current`} />
              ) : (
                <Play className={`${iconSize} ml-0.5 fill-current`} />
              )}
            </button>

            <button
              aria-label="Back 10 seconds"
              onClick={(e) => {
                e.stopPropagation();
                skip(-10);
              }}
              className={`${iconBtn} ${btnSize}`}
            >
              <RotateCcw className={iconSize} />
            </button>

            <button
              aria-label="Forward 10 seconds"
              onClick={(e) => {
                e.stopPropagation();
                skip(10);
              }}
              className={`${iconBtn} ${btnSize}`}
            >
              <RotateCw className={iconSize} />
            </button>

            <div
              className="flex items-center"
              onMouseEnter={() => setShowVolume(true)}
              onMouseLeave={() => setShowVolume(false)}
            >
              <button
                aria-label={isMuted ? "Unmute" : "Mute"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleMute();
                }}
                className={`${iconBtn} ${btnSize}`}
              >
                <VolumeIcon className={iconSize} />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${
                  showVolume && !isMobile
                    ? "w-20 opacity-100 mr-1"
                    : "w-0 opacity-0"
                }`}
              >
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => onVolumeChange(Number(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full h-1 cursor-pointer align-middle"
                  style={{ accentColor: ACCENT }}
                />
              </div>
            </div>

            <span
              className={`text-white/90 ${
                isMobile ? "text-[10px] ml-1" : "text-xs ml-1.5"
              } font-medium tabular-nums select-none`}
            >
              {formatTime(displayTime)}
              <span className="text-white/40 mx-1">/</span>
              <span className="text-white/60">{formatTime(duration)}</span>
            </span>
          </div>

          <div className={`flex items-center ${isMobile ? "gap-1" : "gap-1.5"}`}>
            {/* Speed */}
            <div ref={speedRef} className="relative">
              <button
                aria-label="Playback speed"
                onClick={(e) => {
                  e.stopPropagation();
                  setSpeedOpen(!speedOpen);
                }}
                className="transition-all text-[11px] font-bold px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: speedOpen ? ACCENT : "rgba(255,255,255,0.28)",
                  color: speedOpen ? ACCENT : "rgba(255,255,255,0.9)",
                  backgroundColor: speedOpen
                    ? "rgba(255,204,0,0.12)"
                    : "transparent",
                }}
              >
                {playbackSpeed}x
              </button>

              {speedOpen && (
                <div
                  className="absolute bottom-full mb-2 right-0 flex items-center bg-[#1A1A1A] rounded-full px-1 py-1 shadow-xl border border-white/10 gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {SPEEDS.map((s) => {
                    const isActive = playbackSpeed === s;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          onPlaybackSpeedChange(s);
                          setSpeedOpen(false);
                        }}
                        className={`flex items-center justify-center rounded-full transition-all duration-200 font-bold ${
                          isMobile ? "w-8 h-8 text-[10px]" : "w-9 h-9 text-[11px]"
                        } ${
                          isActive
                            ? ""
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                        style={
                          isActive
                            ? { backgroundColor: ACCENT, color: "#1A1A1A" }
                            : undefined
                        }
                      >
                        {s}x
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen();
              }}
              className={`${iconBtn} ${btnSize}`}
            >
              {isFullscreen ? (
                <Minimize className={iconSize} />
              ) : (
                <Maximize className={iconSize} />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
