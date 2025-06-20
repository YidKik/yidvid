
import React, { useMemo } from "react";
import { VideoGridItem as VideoItemType } from "@/hooks/video/useVideoGridData";
import { VideoGridItem } from "@/components/video/VideoGridItem";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const AnimatedRow: React.FC<{
  videos: VideoItemType[];
  duration?: number; // in seconds
  delay?: number;
  rowIdx?: number;
  onVideoClick?: (videoId: string) => void;
}> = ({ videos, duration = 34, delay = 0, rowIdx = 0, onVideoClick }) => {
  // Duplicate for infinite loop
  const loopVideos = [...videos, ...videos];
  const cardWidthClass = "w-[170px] md:w-[220px]";

  return (
    <div className="relative w-full overflow-x-hidden py-2">
      <div
        className="flex items-center gap-5"
        style={{
          animation: `scroll-x-loop ${duration}s linear infinite`,
          animationDelay: `${delay}s`
        }}
      >
        {loopVideos.map((video, i) => (
          <div
            key={video.id + "-row" + rowIdx + "-i" + i}
            className={`rounded-xl ${cardWidthClass} aspect-video bg-white/60 shadow-md cursor-pointer transition-all duration-200 hover:scale-105`}
            style={{
              boxShadow: `0 2px 12px 0 rgba(80,50,115,0.07)`,
            }}
            onClick={() => onVideoClick && onVideoClick(video.video_id)}
            tabIndex={0}
            role="button"
            aria-label={`View video: ${video.title}`}
          >
            <VideoGridItem video={video} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const AnimatedVideoRows: React.FC<{
  videos: VideoItemType[];
  isLoading: boolean;
  onVideoClick?: (videoId: string) => void;
}> = ({ videos, isLoading, onVideoClick }) => {
  if (isLoading || !videos.length) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center h-full w-full py-16">
        {[0, 1, 2].map((r) => (
          <div key={r} className="flex gap-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="w-[170px] md:w-[220px] aspect-video rounded-xl bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Sort by newest, then shuffle for the lower rows
  const sortedVideos = useMemo(
    () => [...videos].sort((a, b) =>
      new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    ),
    [videos]
  );
  const shuffledA = useMemo(() => shuffle(videos), [videos]);
  const shuffledB = useMemo(() => shuffle(videos), [videos]);

  return (
    <div className="flex flex-col gap-8 pt-14 pb-8 pl-4 pr-2 md:pr-10 h-full">
      <AnimatedRow videos={sortedVideos} duration={34} rowIdx={0} onVideoClick={onVideoClick} />
      <AnimatedRow videos={shuffledA} duration={30} rowIdx={1} onVideoClick={onVideoClick} />
      <AnimatedRow videos={shuffledB} duration={37} rowIdx={2} onVideoClick={onVideoClick} />
    </div>
  );
};
