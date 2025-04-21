
import React, { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import useEmblaCarousel from "embla-carousel-react";
import { useNavigate } from "react-router-dom";
import { ChannelItem } from "./ChannelCarousels";
import { motion } from "framer-motion";
import { useCarouselScroll } from "@/hooks/carousel/useCarouselScroll";

interface ChannelCarouselProps {
  channels: ChannelItem[];
  direction: "ltr" | "rtl";
  speed: number;
  shuffleKey?: number;
}

export const ChannelCarousel = ({ channels, direction, speed, shuffleKey }: ChannelCarouselProps) => {
  const { isMobile } = useIsMobile();
  const navigate = useNavigate();
  
  const [shuffledChannels, setShuffledChannels] = useState<ChannelItem[]>([]);
  
  // Create embla carousel with proper configuration for better scrolling
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: false,
    direction: direction,
    align: "start",
    watchDrag: true,
    skipSnaps: true,
  });

  // Use the improved carousel scroll hook with faster speed
  useCarouselScroll({
    emblaApi,
    direction,
    speed,
    itemsLength: shuffledChannels.length,
  });
  
  // Shuffle and repeat channels to ensure continuous scrolling
  useEffect(() => {
    function shuffle<T>(array: T[]): T[] {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    }
    
    if (channels.length > 0) {
      // Create a much larger set of channels to ensure continuous scrolling
      // Repeat channels 8 times instead of 4
      const repeatedChannels = [
        ...channels, ...channels, ...channels, ...channels,
        ...channels, ...channels, ...channels, ...channels
      ];
      
      console.log(`Created ${repeatedChannels.length} repeated channels for continuous scrolling`);
      setShuffledChannels(shuffle(repeatedChannels));
    }
  }, [channels, shuffleKey]);

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
          {shuffledChannels.map((channel, index) => (
            <motion.div
              key={`${channel.id}-${index}`}
              className="flex-none w-20 h-20 md:w-28 md:h-28 cursor-pointer relative group"
              whileHover={{ scale: 1.1, zIndex: 10 }}
              onClick={() => handleChannelClick(channel.channel_id)}
            >
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md transition-all duration-300 
                            group-hover:border-[#ea384c] group-hover:shadow-lg">
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
              
              <motion.div 
                className="opacity-0 group-hover:opacity-100 absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                          bg-black/70 text-white text-xs md:text-sm px-2 py-1 rounded-md whitespace-nowrap z-20"
                initial={{ y: 5, opacity: 0 }}
                whileHover={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {channel.title}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
