
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PlaybackContextType {
  volume: number;
  playbackSpeed: string;
  setVolume: (volume: number) => void;
  setPlaybackSpeed: (speed: string) => void;
}

const PlaybackContext = createContext<PlaybackContextType | undefined>(undefined);

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error('usePlayback must be used within a PlaybackProvider');
  }
  return context;
};

export const PlaybackProvider = ({ children }: { children: ReactNode }) => {
  const [volume, setVolume] = useState(80);
  const [playbackSpeed, setPlaybackSpeed] = useState('1');

  useEffect(() => {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setVolume(settings.volume ?? 80);
      setPlaybackSpeed(settings.playbackSpeed ?? '1');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify({
      volume,
      playbackSpeed,
    }));

    // Update all YouTube iframes with the new settings
    const iframes = document.querySelectorAll('iframe[src*="youtube.com"]');
    iframes.forEach(iframe => {
      const player = (iframe as any).contentWindow;
      if (player && player.postMessage) {
        // Set volume (YouTube API expects volume between 0 and 100)
        player.postMessage(JSON.stringify({
          event: 'command',
          func: 'setVolume',
          args: [volume]
        }), '*');

        // Set playback speed
        player.postMessage(JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [parseFloat(playbackSpeed)]
        }), '*');
      }
    });
  }, [volume, playbackSpeed]);

  return (
    <PlaybackContext.Provider value={{ volume, playbackSpeed, setVolume, setPlaybackSpeed }}>
      {children}
    </PlaybackContext.Provider>
  );
};
