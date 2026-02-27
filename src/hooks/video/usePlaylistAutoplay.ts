import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePlaylistItems } from '@/hooks/useVideoLibrary';

interface PlaylistAutoplayState {
  playlistId: string | null;
  playlistItems: any[];
  shuffledOrder: number[];
  currentIndex: number;
  isPlaylistMode: boolean;
  playlistTitle?: string;
}

export const usePlaylistAutoplay = (currentVideoId: string) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get('playlist');
  const { data: items } = usePlaylistItems(playlistId || undefined);
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([]);
  const shuffledRef = useRef(false);

  // Shuffle on first load or when playlist changes
  useEffect(() => {
    if (!items || items.length === 0) {
      setShuffledOrder([]);
      shuffledRef.current = false;
      return;
    }

    // Only shuffle once per playlist session
    if (shuffledRef.current && shuffledOrder.length === items.length) return;

    const indices = items.map((_, i) => i);
    // Fisher-Yates shuffle
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    setShuffledOrder(indices);
    shuffledRef.current = true;
  }, [items]);

  // Find current video position in shuffled order
  const currentShuffledIndex = shuffledOrder.findIndex((itemIndex) => {
    const item = items?.[itemIndex];
    return item?.video?.video_id === currentVideoId;
  });

  const goToNextVideo = useCallback(() => {
    if (!items || items.length === 0 || shuffledOrder.length === 0 || !playlistId) return;

    let nextShuffledIndex: number;
    if (currentShuffledIndex === -1) {
      // Current video not in shuffled order, start from beginning
      nextShuffledIndex = 0;
    } else {
      // Go to next, wrap around
      nextShuffledIndex = (currentShuffledIndex + 1) % shuffledOrder.length;
    }

    const nextItemIndex = shuffledOrder[nextShuffledIndex];
    const nextItem = items[nextItemIndex];

    if (nextItem?.video?.video_id) {
      navigate(`/video/${nextItem.video.video_id}?playlist=${playlistId}`);
    }
  }, [items, shuffledOrder, currentShuffledIndex, playlistId, navigate]);

  return {
    isPlaylistMode: !!playlistId && !!items && items.length > 0,
    playlistId,
    totalVideos: items?.length || 0,
    currentPosition: currentShuffledIndex + 1,
    goToNextVideo,
  };
};
