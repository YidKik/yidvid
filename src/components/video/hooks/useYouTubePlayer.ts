import { useState, useEffect, useCallback, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

interface YouTubePlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isReady: boolean;
  buffered: number;
  hasEnded: boolean;
}

const loadYouTubeAPI = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.YT && window.YT.Player) {
      resolve();
      return;
    }
    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    );
    if (existingScript) {
      const check = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 100);
      return;
    }
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
};

export const useYouTubePlayer = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  videoId: string,
  onVideoEnd?: () => void
) => {
  const [state, setState] = useState<YouTubePlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    isMuted: false,
    isReady: false,
    buffered: 0,
    hasEnded: false,
  });

  const playerRef = useRef<any>(null);
  const previousVolumeRef = useRef(80);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onVideoEndRef = useRef(onVideoEnd);

  useEffect(() => {
    onVideoEndRef.current = onVideoEnd;
  }, [onVideoEnd]);

  // Poll current time / buffered when playing
  useEffect(() => {
    if (state.isPlaying && playerRef.current) {
      intervalRef.current = setInterval(() => {
        const p = playerRef.current;
        if (!p || typeof p.getCurrentTime !== "function") return;
        try {
          const ct = p.getCurrentTime() || 0;
          const dur = p.getDuration() || 0;
          const loaded = p.getVideoLoadedFraction() || 0;
          setState((s) => ({
            ...s,
            currentTime: ct,
            duration: dur,
            buffered: loaded,
          }));
        } catch {
          // player might be destroyed
        }
      }, 250);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state.isPlaying]);

  // Create / recreate YT.Player when videoId changes
  useEffect(() => {
    if (!videoId || !containerRef.current) return;

    let destroyed = false;

    const init = async () => {
      await loadYouTubeAPI();
      if (destroyed) return;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }

      const container = containerRef.current;
      if (!container) return;
      container.innerHTML = "";
      const playerDiv = document.createElement("div");
      playerDiv.id = "yt-player-" + videoId;
      container.appendChild(playerDiv);

      const player = new window.YT.Player(playerDiv.id, {
        videoId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          disablekb: 1,        // Disable YouTube keyboard shortcuts
          playsinline: 1,
          fs: 0,
          controls: 0,         // Hide native controls
          showinfo: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            if (destroyed) return;
            const vol = event.target.getVolume();
            const dur = event.target.getDuration();
            setState((s) => ({
              ...s,
              isReady: true,
              volume: vol,
              duration: dur,
            }));
          },
          onStateChange: (event: any) => {
            if (destroyed) return;
            const ps = event.data;
            setState((s) => ({
              ...s,
              isPlaying: ps === 1 || ps === 3,
              hasEnded: ps === 0,
            }));
            if (ps === 0 && onVideoEndRef.current) {
              onVideoEndRef.current();
            }
          },
        },
      });

      playerRef.current = player;
    };

    setState({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 80,
      isMuted: false,
      isReady: false,
      buffered: 0,
      hasEnded: false,
    });

    init();

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}
        playerRef.current = null;
      }
    };
  }, [videoId, containerRef]);

  const play = useCallback(() => {
    try {
      playerRef.current?.playVideo();
    } catch {}
  }, []);

  const pause = useCallback(() => {
    try {
      playerRef.current?.pauseVideo();
    } catch {}
  }, []);

  // Query the actual YT player state for reliable toggle
  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const ps = typeof p.getPlayerState === "function" ? p.getPlayerState() : -1;
      // 1 = playing, 3 = buffering → pause; otherwise play
      if (ps === 1 || ps === 3) {
        p.pauseVideo();
      } else {
        p.playVideo();
      }
    } catch {}
  }, []);

  const seek = useCallback((time: number) => {
    try {
      playerRef.current?.seekTo(time, true);
      setState((s) => ({ ...s, currentTime: time }));
    } catch {}
  }, []);

  const setVolume = useCallback((vol: number) => {
    try {
      const p = playerRef.current;
      if (!p) return;
      p.setVolume(vol);
      if (vol > 0) {
        p.unMute();
        previousVolumeRef.current = vol;
      }
      setState((s) => ({ ...s, volume: vol, isMuted: vol === 0 }));
    } catch {}
  }, []);

  const toggleMute = useCallback(() => {
    try {
      const p = playerRef.current;
      if (!p) return;
      if (state.isMuted || state.volume === 0) {
        const restoreVol = previousVolumeRef.current || 80;
        p.unMute();
        p.setVolume(restoreVol);
        setState((s) => ({ ...s, isMuted: false, volume: restoreVol }));
      } else {
        previousVolumeRef.current = state.volume;
        p.mute();
        setState((s) => ({ ...s, isMuted: true }));
      }
    } catch {}
  }, [state.isMuted, state.volume]);

  const setPlaybackRate = useCallback((rate: number) => {
    try {
      playerRef.current?.setPlaybackRate(rate);
    } catch {}
  }, []);

  return {
    ...state,
    play,
    pause,
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
  };
};
