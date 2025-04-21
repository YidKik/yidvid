
import { useState, useEffect } from "react";
import { VideoGridItem as VideoGridItemType } from "@/hooks/video/useVideoGridData";

export const useShuffledVideos = (videos: VideoGridItemType[], shuffleKey?: number) => {
  const [shuffledVideos, setShuffledVideos] = useState<VideoGridItemType[]>([]);
  
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
    
    if (videos.length > 0) {
      // Create a MUCH larger set of videos by repeating them many more times
      // This ensures continuous and very noticeable scrolling
      const repeatedVideos = [];
      
      // Repeat videos 20 times to ensure plenty of content for continuous scrolling
      for (let i = 0; i < 20; i++) {
        repeatedVideos.push(...videos);
      }
      
      console.log(`Created ${repeatedVideos.length} repeated videos for continuous scrolling`);
      setShuffledVideos(shuffle(repeatedVideos));
    }
  }, [videos, shuffleKey]);

  return shuffledVideos;
};
