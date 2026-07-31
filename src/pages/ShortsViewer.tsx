
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShortsNavigation } from "@/hooks/video/useShortsNavigation";
import { ChevronUp, ChevronDown, X, ThumbsUp, Share2, Play, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

const ShortsViewer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { shorts, isLoading, currentIndex: initialIndex } = useShortsNavigation(videoId);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const { isMobile } = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isTransitioning = useRef(false);
  const touchStartY = useRef(0);

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  // Update URL when active short changes
  useEffect(() => {
    if (shorts.length > 0 && shorts[activeIndex]) {
      const newId = shorts[activeIndex].video_id;
      if (newId !== videoId) {
        navigate(`/shorts/${newId}`, { replace: true });
      }
    }
  }, [activeIndex, shorts]);

  const go = useCallback(
    (delta: number) => {
      if (isTransitioning.current) return;
      const next = activeIndex + delta;
      if (next < 0 || next > shorts.length - 1) return;
      isTransitioning.current = true;
      setIsPaused(false);
      setActiveIndex(next);
      setTimeout(() => {
        isTransitioning.current = false;
      }, 350);
    },
    [activeIndex, shorts.length]
  );

  const goNext = useCallback(() => go(1), [go]);
  const goPrev = useCallback(() => go(-1), [go]);

  const togglePlay = useCallback(() => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({
        event: "command",
        func: isPaused ? "playVideo" : "pauseVideo",
        args: [],
      }),
      "*"
    );
    setIsPaused((p) => !p);
  }, [isPaused]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      else if (e.key === "ArrowUp" || e.key === "k") goPrev();
      else if (e.key === "Escape") navigate(-1);
      else if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, navigate, togglePlay]);

  // Touch/swipe navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 45) {
        if (diff > 0) goNext();
        else goPrev();
      }
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [goNext, goPrev]);

  // Mouse wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 30) {
        if (e.deltaY > 0) goNext();
        else goPrev();
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0b0b0b] flex items-center justify-center z-[60]">
        <Loader2 className="w-8 h-8 animate-spin text-[#FFCC00]" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0b0b0b] flex items-center justify-center z-[60]">
        <div className="text-white text-center px-6">
          <p className="text-lg mb-4">No shorts available</p>
          <button
            onClick={() => navigate("/videos")}
            className="px-6 py-2 bg-[#FFCC00] text-black rounded-full text-sm font-semibold hover:brightness-95 transition"
          >
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  const currentShort = shorts[activeIndex];
  const formatViews = (views: number) => {
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
    return views.toString();
  };

  const handleShare = () => {
    const url = `${window.location.origin}/shorts/${currentShort.video_id}`;
    if (navigator.share) {
      navigator.share({ title: currentShort.title, url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url);
      toast("Link copied");
    }
  };

  return (
    <>
      <Helmet>
        <title>{currentShort?.title || "Shorts"} | YidVid</title>
      </Helmet>

      <div
        ref={containerRef}
        className="fixed inset-0 z-[60] overflow-hidden bg-[#0b0b0b] flex items-center justify-center"
        style={{ height: "100dvh" }}
      >
        {/* Ambient backdrop from the current thumbnail */}
        <div
          className="absolute inset-0 opacity-30 blur-3xl scale-110 pointer-events-none"
          style={{
            backgroundImage: `url(${currentShort.thumbnail})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-40 flex items-center justify-between px-3 sm:px-5 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="Close shorts"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-white/70">
            Shorts
          </span>
          <span className="text-[11px] sm:text-xs text-white/50 tabular-nums">
            {activeIndex + 1}/{shorts.length}
          </span>
        </div>

        {/* Stage */}
        <div
          className="relative flex items-center justify-center w-full"
          style={{ height: "100dvh" }}
        >
          <div
            className={`relative bg-black overflow-hidden ${
              isMobile ? "w-full h-full" : "rounded-[28px] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)]"
            }`}
            style={
              isMobile
                ? undefined
                : {
                    height: "min(92dvh, 900px)",
                    aspectRatio: "9 / 16",
                    maxWidth: "94vw",
                  }
            }
          >
            {/* Player */}
            <iframe
              ref={iframeRef}
              key={currentShort.video_id}
              src={`https://www.youtube.com/embed/${currentShort.video_id}?autoplay=1&mute=0&loop=1&playlist=${currentShort.video_id}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&playsinline=1&disablekb=1&fs=0&enablejsapi=1`}
              className="absolute inset-0 w-full h-full pointer-events-none"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              title={currentShort.title}
            />

            {/* Tap layer: swallows YouTube branding/clicks, toggles play */}
            <div className="absolute inset-0 z-10" onClick={togglePlay} />

            {/* Pause indicator */}
            {isPaused && (
              <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
                  <Play className="w-8 h-8 text-[#FFCC00] fill-[#FFCC00] ml-1" />
                </div>
              </div>
            )}

            {/* Bottom info */}
            <div className="absolute inset-x-0 bottom-0 z-20 pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 pt-20 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <div className="pr-16">
                <button
                  onClick={() => navigate(`/channel/${currentShort.channel_id}`)}
                  className="pointer-events-auto flex items-center gap-2 mb-2"
                >
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {currentShort.channel_name}
                  </span>
                </button>
                <h1 className="text-white font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2">
                  {currentShort.title}
                </h1>
                {currentShort.views != null && currentShort.views > 0 && (
                  <p className="mt-1.5 text-[11px] sm:text-xs text-white/60">
                    {formatViews(currentShort.views)} views
                  </p>
                )}
              </div>
            </div>

            {/* Side actions */}
            <div className="absolute z-30 right-2.5 sm:right-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] flex flex-col items-center gap-4">
              <button
                onClick={() => navigate(`/channel/${currentShort.channel_id}`)}
                aria-label={currentShort.channel_name}
                className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-[#FFCC00] shadow-lg"
              >
                {currentShort.channelThumbnail ? (
                  <img src={currentShort.channelThumbnail} alt={currentShort.channel_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#FFCC00] flex items-center justify-center text-black font-bold text-sm">
                    {currentShort.channel_name?.[0]}
                  </div>
                )}
              </button>
              <SideButton icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
              <SideButton icon={<Share2 className="w-5 h-5" />} label="Share" onClick={handleShare} />
            </div>

            {/* Progress rail */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] z-30 bg-white/10">
              <div
                className="w-full bg-[#FFCC00] transition-all duration-300"
                style={{ height: `${((activeIndex + 1) / shorts.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Desktop navigation arrows */}
        {!isMobile && (
          <div className="absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3">
            <NavArrow onClick={goPrev} disabled={activeIndex === 0} icon={<ChevronUp className="w-6 h-6" />} label="Previous short" />
            <NavArrow onClick={goNext} disabled={activeIndex >= shorts.length - 1} icon={<ChevronDown className="w-6 h-6" />} label="Next short" />
          </div>
        )}
      </div>
    </>
  );
};

const NavArrow = ({
  onClick,
  disabled,
  icon,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    className={`w-11 h-11 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${
      disabled
        ? "bg-white/5 text-white/20 cursor-not-allowed"
        : "bg-white/10 text-white hover:bg-[#FFCC00] hover:text-black"
    }`}
  >
    {icon}
  </button>
);

const SideButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 text-white/85 hover:text-white transition-colors">
    <div className="w-11 h-11 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
      {icon}
    </div>
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default ShortsViewer;
