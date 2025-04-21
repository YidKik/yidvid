
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useVideoGridData } from "@/hooks/video/useVideoGridData";
import { cn } from "@/lib/utils";

/**
 * VideoShowcase - A video showcase with proper scroll-based animations
 * Features:
 * - 4 rows of scrolling videos (alternating directions)
 * - Rotation and scaling on scroll
 * - Clickable videos that navigate to video page
 */
export const VideoShowcase = () => {
  const { videos, loading } = useVideoGridData(60);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      // Use a lower max scroll value (300px) for faster animation effect
      const maxScroll = 400;
      const progress = Math.min(window.scrollY / maxScroll, 1);
      setScrollProgress(progress);
      console.log("Scroll progress:", progress); // Debug log
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading || !videos.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm z-0">
        <div className="text-2xl font-bold text-purple-400 animate-pulse">
          Loading videos...
        </div>
      </div>
    );
  }

  // Create video rows with different sets of videos
  const videoRows = [
    { videos: videos.slice(0, 15), direction: "right", speed: 120 },
    { videos: videos.slice(15, 30), direction: "left", speed: 100 },
    { videos: videos.slice(30, 45), direction: "right", speed: 140 },
    { videos: videos.slice(45, 60), direction: "left", speed: 90 },
  ];

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
    >
      <div 
        className="flex flex-col gap-6 py-8 transform-gpu"
        style={{
          transform: `scale(${1 + scrollProgress * 0.8})`,
          opacity: Math.max(0.4, 1 - scrollProgress * 0.6),
          transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
        }}
      >
        {videoRows.map((row, index) => (
          <VideoRow
            key={index}
            videos={row.videos}
            direction={row.direction as "left" | "right"}
            speed={row.speed}
            rowIndex={index}
            scrollProgress={scrollProgress}
          />
        ))}
      </div>
    </div>
  );
};

interface VideoRowProps {
  videos: any[];
  direction: "left" | "right";
  speed: number;
  rowIndex: number;
  scrollProgress: number;
}

const VideoRow = ({ videos, direction, speed, rowIndex, scrollProgress }: VideoRowProps) => {
  // Use even more rotation for dramatic effect - increased rotation values
  const rotationAngles = [40, -45, 35, -50]; // Increased rotation angles for more dramatic effect
  const rotationAngle = rotationAngles[rowIndex % rotationAngles.length] * scrollProgress;
  
  // Animation name based on direction and row
  const animationName = `scroll-${direction}-${rowIndex}`;
  const doubledVideos = [...videos, ...videos]; // Double videos for seamless looping
  
  // Create keyframes for the animation
  useEffect(() => {
    if (!document.getElementById(animationName)) {
      const style = document.createElement("style");
      style.id = animationName;
      
      // Adjust direction based on prop
      const fromPosition = direction === "left" ? "0%" : "-100%";
      const toPosition = direction === "left" ? "-100%" : "0%";
      
      style.innerHTML = `
        @keyframes ${animationName} {
          from { transform: translateX(${fromPosition}); }
          to { transform: translateX(${toPosition}); }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        if (document.getElementById(animationName)) {
          document.head.removeChild(document.getElementById(animationName)!);
        }
      };
    }
  }, [animationName, direction]);

  return (
    <div 
      className="relative w-full overflow-visible"
      style={{
        height: "260px",
        transform: `rotate(${rotationAngle}deg)`,
        transition: "transform 0.2s ease-out",
        zIndex: rowIndex + 1,
      }}
    >
      <div
        className="absolute flex gap-4"
        style={{
          animation: `${animationName} ${speed}s linear infinite`,
          width: "200%", // Double width for continuous scrolling
        }}
      >
        {doubledVideos.map((video, idx) => (
          <VideoCard key={`${video.id}-${idx}`} video={video} scrollProgress={scrollProgress} />
        ))}
      </div>
    </div>
  );
};

interface VideoCardProps {
  video: any;
  scrollProgress: number;
}

const VideoCard = ({ video, scrollProgress }: VideoCardProps) => {
  // Increase scale based on scroll progress
  const scale = 1 + scrollProgress * 0.4; // Increased scale effect
  
  return (
    <Link
      to={`/video/${video.id}`}
      className={cn(
        "relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg border border-white/20",
        "transition-all duration-200 ease-out pointer-events-auto"
      )}
      style={{
        width: "350px",
        height: "240px",
        transform: `scale(${scale})`,
      }}
    >
      <img
        src={video.thumbnail || "/placeholder.svg"}
        alt={video.title || "Video thumbnail"}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70"></div>
      
      {/* Video info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
        <h3 className="text-sm font-bold truncate">{video.title}</h3>
        <p className="text-xs opacity-80 truncate">{video.channelName}</p>
      </div>
    </Link>
  );
};
