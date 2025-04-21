
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
      setShuffledVideos(shuffle(videos));
    }
  }, [videos, shuffleKey]);

  return shuffledVideos;
};
