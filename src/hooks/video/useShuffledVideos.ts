
import { useState, useEffect } from 'react';
import { VideoGridItem } from '@/hooks/video/useVideoGridData';

/**
 * Hook that shuffles an array of videos based on a key
 * @param videos Array of videos to shuffle
 * @param key Optional key to trigger reshuffling
 * @returns Shuffled array of videos
 */
export const useShuffledVideos = (
  videos: VideoGridItem[] | undefined, 
  key?: number
): VideoGridItem[] => {
  const [shuffled, setShuffled] = useState<VideoGridItem[]>([]);

  useEffect(() => {
    if (!videos || videos.length === 0) {
      setShuffled([]);
      return;
    }

    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array: VideoGridItem[]): VideoGridItem[] => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };

    setShuffled(shuffleArray(videos));
  }, [videos, key]);

  return shuffled;
};
