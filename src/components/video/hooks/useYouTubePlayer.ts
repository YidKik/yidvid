import { useState, useEffect, useCallback, useRef } from "react";

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

export const useYouTubePlayer = (
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
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

  const previousVolumeRef = useRef(80);
  const seekingRef = useRef(false);

  const postCommand = useCallback(
    (func: string, args: any = "") => {
      const iframe = iframeRef.current;
      if (iframe?.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func,
            args,
          }),
          "*"
        );
      }
    },
    [iframeRef]
  );

  // Initialize the YouTube IFrame API by sending "listening" message
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const sendListening = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: "listening",
            id: "custom-youtube-player",
            channel: "widget",
          }),
          "*"
        );

        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "addEventListener",
            args: ["onReady"],
            id: "custom-youtube-player",
            channel: "widget",
          }),
          "*"
        );

        iframe.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "addEventListener",
            args: ["onStateChange"],
            id: "custom-youtube-player",
            channel: "widget",
          }),
          "*"
        );
      }
    };

    // Send listening on load and also periodically until ready
    const onLoad = () => {
      sendListening();
    };
    iframe.addEventListener("load", onLoad);

    // Retry sending "listening" until we get onReady
    const interval = setInterval(() => {
      if (!state.isReady) {
        sendListening();
      } else {
        clearInterval(interval);
      }
    }, 250);

    // Also try immediately
    sendListening();

    return () => {
      iframe.removeEventListener("load", onLoad);
      clearInterval(interval);
    };
  }, [iframeRef, state.isReady]);

  // Listen for YouTube messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Accept messages from YouTube origins
      if (
        event.origin !== "https://www.youtube.com" &&
        event.origin !== "https://www.youtube-nocookie.com"
      )
        return;

      try {
        const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;

        if (data.event === "onReady") {
          setState((s) => ({ ...s, isReady: true }));
        }

        if (data.event === "onStateChange") {
          // -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
          const playerState = data.info;
          setState((s) => ({
            ...s,
            isPlaying: playerState === 1,
            hasEnded: playerState === 0,
          }));
          if (playerState === 0 && onVideoEnd) {
            onVideoEnd();
          }
        }

        if (data.event === "infoDelivery" && data.info) {
          setState((s) => {
            const updates: Partial<YouTubePlayerState> = {};

            if (
              typeof data.info.currentTime === "number" &&
              !seekingRef.current
            ) {
              updates.currentTime = data.info.currentTime;
            }
            if (typeof data.info.duration === "number" && data.info.duration > 0) {
              updates.duration = data.info.duration;
            }
            if (typeof data.info.volume === "number") {
              updates.volume = data.info.volume;
            }
            if (typeof data.info.muted === "boolean") {
              updates.isMuted = data.info.muted;
            }
            if (data.info.videoLoadedFraction !== undefined) {
              updates.buffered = data.info.videoLoadedFraction;
            }

            return { ...s, ...updates };
          });
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onVideoEnd]);

  const play = useCallback(() => postCommand("playVideo"), [postCommand]);
  const pause = useCallback(() => postCommand("pauseVideo"), [postCommand]);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else play();
  }, [state.isPlaying, play, pause]);

  const seek = useCallback(
    (time: number) => {
      seekingRef.current = true;
      setState((s) => ({ ...s, currentTime: time }));
      postCommand("seekTo", [time, true]);
      setTimeout(() => {
        seekingRef.current = false;
      }, 500);
    },
    [postCommand]
  );

  const setVolume = useCallback(
    (vol: number) => {
      setState((s) => ({ ...s, volume: vol, isMuted: vol === 0 }));
      postCommand("setVolume", [vol]);
      if (vol > 0) previousVolumeRef.current = vol;
    },
    [postCommand]
  );

  const toggleMute = useCallback(() => {
    if (state.isMuted || state.volume === 0) {
      const restoreVol = previousVolumeRef.current || 80;
      setVolume(restoreVol);
      postCommand("unMute");
    } else {
      previousVolumeRef.current = state.volume;
      postCommand("mute");
      setState((s) => ({ ...s, isMuted: true }));
    }
  }, [state.isMuted, state.volume, setVolume, postCommand]);

  const setPlaybackRate = useCallback(
    (rate: number) => postCommand("setPlaybackRate", [rate]),
    [postCommand]
  );

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
