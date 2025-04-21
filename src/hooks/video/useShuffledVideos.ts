
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
      // Create a larger set of videos by repeating them multiple times
      // This ensures continuous scrolling even with few videos
      const repeatedVideos = [...videos, ...videos, ...videos, ...videos];
      setShuffledVideos(shuffle(repeatedVideos));
    }
  }, [videos, shuffleKey]);

  return shuffledVideos;
};
