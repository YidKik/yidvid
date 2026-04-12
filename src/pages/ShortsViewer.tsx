
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useShortsNavigation } from "@/hooks/video/useShortsNavigation";
import { ChevronUp, ChevronDown, X, ThumbsUp, Share2, MessageCircle, Eye } from "lucide-react";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const ShortsViewer = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { shorts, isLoading, currentIndex: initialIndex } = useShortsNavigation(videoId);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const { isMobile } = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const isTransitioning = useRef(false);
  const touchStartY = useRef(0);

  // Sync initial index when data loads
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

  const goNext = useCallback(() => {
    if (isTransitioning.current) return;
    if (activeIndex < shorts.length - 1) {
      isTransitioning.current = true;
      setActiveIndex(prev => prev + 1);
      setTimeout(() => { isTransitioning.current = false; }, 400);
    }
  }, [activeIndex, shorts.length]);

  const goPrev = useCallback(() => {
    if (isTransitioning.current) return;
    if (activeIndex > 0) {
      isTransitioning.current = true;
      setActiveIndex(prev => prev - 1);
      setTimeout(() => { isTransitioning.current = false; }, 400);
    }
  }, [activeIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "j") goNext();
      else if (e.key === "ArrowUp" || e.key === "k") goPrev();
      else if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, navigate]);

  // Touch/swipe navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) {
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
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="text-white text-center">
          <p className="text-lg mb-4">No shorts available</p>
          <button onClick={() => navigate("/videos")} className="px-6 py-2 bg-red-500 rounded-full text-sm font-medium hover:bg-red-600 transition-colors">
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

  return (
    <>
      <Helmet>
        <title>{currentShort?.title || "Shorts"} | YidVid</title>
      </Helmet>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 z-50 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Navigation arrows - desktop only */}
        {!isMobile && (
          <>
            <button
              onClick={goPrev}
              disabled={activeIndex === 0}
              className={`absolute ${isMobile ? 'top-4 right-14' : 'right-8 top-1/2 -translate-y-12'} z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                activeIndex === 0
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ChevronUp className="w-6 h-6" />
            </button>
            <button
              onClick={goNext}
              disabled={activeIndex >= shorts.length - 1}
              className={`absolute ${isMobile ? 'bottom-4 right-14' : 'right-8 top-1/2 translate-y-2'} z-50 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                activeIndex >= shorts.length - 1
                  ? 'bg-white/5 text-white/20 cursor-not-allowed'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Short video container */}
        <div className={`relative ${isMobile ? 'w-full h-full' : 'w-[360px] h-[640px] rounded-2xl overflow-hidden'}`}>
          {/* YouTube embed */}
          <iframe
            key={currentShort.video_id}
            src={`https://www.youtube.com/embed/${currentShort.video_id}?autoplay=1&loop=1&playlist=${currentShort.video_id}&controls=1&modestbranding=1&rel=0`}
            className="absolute inset-0 w-full h-full"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={currentShort.title}
          />

          {/* Bottom overlay with info */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-16 pointer-events-none">
            <h3 className="text-white font-semibold text-sm leading-tight mb-1 line-clamp-2">
              {currentShort.title}
            </h3>
            <p className="text-white/70 text-xs">
              {currentShort.channel_name}
            </p>
            {currentShort.views != null && currentShort.views > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <Eye className="w-3 h-3 text-white/50" />
                <span className="text-white/50 text-[11px]">{formatViews(currentShort.views)} views</span>
              </div>
            )}
          </div>

          {/* Side actions */}
          <div className={`absolute ${isMobile ? 'right-3 bottom-28' : 'right-3 bottom-24'} flex flex-col items-center gap-5 z-10`}>
            <button className="flex flex-col items-center gap-1 group" onClick={() => navigate(`/channel/${currentShort.channel_id}`)}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg">
                {currentShort.channelThumbnail ? (
                  <img src={currentShort.channelThumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-red-500 flex items-center justify-center text-white font-bold text-sm">
                    {currentShort.channel_name[0]}
                  </div>
                )}
              </div>
            </button>
            <SideButton icon={<ThumbsUp className="w-5 h-5" />} label="Like" />
            <SideButton icon={<Share2 className="w-5 h-5" />} label="Share" onClick={() => {
              navigator.clipboard?.writeText(`${window.location.origin}/shorts/${currentShort.video_id}`);
            }} />
          </div>
        </div>

        {/* Progress indicator */}
        <div className={`absolute ${isMobile ? 'bottom-2 left-1/2 -translate-x-1/2' : 'left-8 top-1/2 -translate-y-1/2'} flex ${isMobile ? 'flex-row gap-1' : 'flex-col gap-1'}`}>
          {shorts.slice(Math.max(0, activeIndex - 3), Math.min(shorts.length, activeIndex + 4)).map((_, i) => {
            const actualIndex = Math.max(0, activeIndex - 3) + i;
            return (
              <div
                key={actualIndex}
                className={`rounded-full transition-all duration-300 ${
                  actualIndex === activeIndex
                    ? 'bg-red-500 w-2 h-2'
                    : 'bg-white/30 w-1.5 h-1.5'
                }`}
              />
            );
          })}
        </div>
      </div>
    </>
  );
};

const SideButton = ({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-0.5 text-white/80 hover:text-white transition-colors">
    <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
      {icon}
    </div>
    <span className="text-[10px]">{label}</span>
  </button>
);

export default ShortsViewer;
