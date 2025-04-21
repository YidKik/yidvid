
import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";
import { useNavigate } from "react-router-dom";
import { useCarouselScroll } from "@/hooks/carousel/useCarouselScroll";
import { useShuffledVideos } from "@/hooks/video/useShuffledVideos";
import { VideoCarouselItem } from "./VideoCarouselItem";

interface VideoCarouselProps {
  videos: VideoGridItemType[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
  onVideoClick?: (videoId: string) => void;
}

export const VideoCarousel = ({ 
  videos, 
  direction, 
  speed, 
  shuffleKey,
  onVideoClick 
}: VideoCarouselProps) => {
  const navigate = useNavigate();
  const shuffledVideos = useShuffledVideos(videos, shuffleKey);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });

  useCarouselScroll({
    emblaApi,
    direction,
    speed,
    itemsLength: shuffledVideos.length,
  });

  const handleVideoClick = (videoId: string) => {
    if (onVideoClick) {
      onVideoClick(videoId);
    }
  };

  if (!shuffledVideos || shuffledVideos.length === 0) {
    return null;
  }

  return (
    <div className="px-2 md:px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-3 md:gap-4">
          {shuffledVideos.map((video) => (
            <VideoCarouselItem
              key={video.id}
              video={video}
              onClick={handleVideoClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
