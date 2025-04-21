
import React, { useRef, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate } from "react-router-dom";
import { ChannelItem } from "./ChannelCarousels";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface ChannelCarouselProps {
  channels: ChannelItem[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
}

export const ChannelCarousel = ({ channels, direction, speed, shuffleKey }: ChannelCarouselProps) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  
  // Shuffle channels
  const [shuffledChannels, setShuffledChannels] = useState<ChannelItem[]>([]);
  
  useEffect(() => {
    // Shuffle utility
    function shuffle<T>(array: T[]): T[] {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    
    if (channels.length > 0) {
      setShuffledChannels(shuffle(channels));
    }
  }, [channels, shuffleKey]);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps",
    direction: direction === "rtl" ? "rtl" : "ltr",
    align: "start",
  });

  const scrolling = useRef<boolean>(false);
  const animationRef = useRef<number>();

  // Handle continuous auto-scroll animation
  useEffect(() => {
    if (!emblaApi || shuffledChannels.length === 0) return;
    
    // Re-initialize the carousel when channels change
    emblaApi.reInit();
    
    const scrollStep = speed * 0.02; // Control speed (pixels per frame)
    let lastTime = 0;
    
    const scroll = (timestamp: number) => {
      if (!emblaApi) return;
      
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      
      if (!scrolling.current) {
        // Calculate the scroll amount based on direction and speed
        const scrollAmount = (direction === "rtl" ? -1 : 1) * scrollStep * (deltaTime / 16);
        
        // Use scrollSnaps and selectedScrollSnap for proper scrolling
        const scrollSnaps = emblaApi.scrollSnapList();
        const currentIndex = emblaApi.selectedScrollSnap();
        const nextIndex = (currentIndex + 1) % scrollSnaps.length;
        const prevIndex = currentIndex === 0 ? scrollSnaps.length - 1 : currentIndex - 1;
        
        // Determine target based on direction
        const targetIndex = direction === "ltr" ? nextIndex : prevIndex;
        const currentPosition = emblaApi.scrollProgress();
        
        // Create smooth scrolling effect
        if (direction === "ltr") {
          emblaApi.scrollTo(currentPosition + scrollAmount);
          // If we reach the end of current slide, snap to next
          if (currentPosition >= 0.98) emblaApi.scrollTo(nextIndex);
        } else {
          emblaApi.scrollTo(currentPosition - scrollAmount);
          // If we reach the beginning of current slide, snap to previous
          if (currentPosition <= 0.02) emblaApi.scrollTo(prevIndex);
        }
      }
      
      animationRef.current = requestAnimationFrame(scroll);
    };
    
    animationRef.current = requestAnimationFrame(scroll);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [emblaApi, direction, speed, shuffledChannels]);

  // Handle user interaction to pause auto-scroll
  useEffect(() => {
    if (!emblaApi) return;
    
    const onPointerDown = () => {
      scrolling.current = true;
    };
    
    const onPointerUp = () => {
      scrolling.current = false;
    };
    
    emblaApi.on("pointerDown", onPointerDown);
    emblaApi.on("pointerUp", onPointerUp);
    
    return () => {
      emblaApi.off("pointerDown", onPointerDown);
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  // Handle channel click
  const handleChannelClick = (channelId: string) => {
    navigate(`/channel/${channelId}`);
  };

  if (!shuffledChannels || shuffledChannels.length === 0) {
    return null;
  }

  return (
    <div className="px-2 md:px-4">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 md:gap-6">
          {shuffledChannels.map((channel) => (
            <div
              key={channel.id}
              className="flex-none w-20 h-20 md:w-28 md:h-28 cursor-pointer relative group"
              onClick={() => handleChannelClick(channel.channel_id)}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/50 shadow-md transition-all duration-300 
                            group-hover:border-white group-hover:shadow-lg group-hover:scale-105">
                {channel.thumbnail_url ? (
                  <img 
                    src={channel.thumbnail_url} 
                    alt={channel.title}
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold">
                    {channel.title.charAt(0)}
                  </div>
                )}
              </div>
              
              {/* Hover tooltip with channel name */}
              <div className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                            bg-black/70 text-white text-xs md:text-sm px-2 py-1 rounded-md whitespace-nowrap
                            transition-opacity duration-300">
                {channel.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
