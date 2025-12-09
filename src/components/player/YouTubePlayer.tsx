"use client";

import { useEffect, useRef, useCallback } from "react";
import YouTube, { YouTubeEvent, YouTubePlayer as YTPlayer } from "react-youtube";
import { usePlayerStore } from "@/lib/store";

export function YouTubePlayer() {
  const playerRef = useRef<YTPlayer | null>(null);
  const {
    currentSong,
    playerState,
    volume,
    muted,
    setPlayerState,
    setProgress,
    setDuration,
    setLoaded,
    playNext,
    setPlayerRef,
  } = usePlayerStore();

  // Register player ref with store for seeking
  useEffect(() => {
    if (playerRef.current) {
      setPlayerRef({
        seekTo: (seconds: number) => {
          if (playerRef.current) {
            playerRef.current.seekTo(seconds, true);
          }
        },
      });
    }
    return () => setPlayerRef(null);
  }, [setPlayerRef]);

  // Update progress periodically
  useEffect(() => {
    if (playerState !== "playing" || !playerRef.current) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        const duration = playerRef.current.getDuration();
        const loadedFraction = playerRef.current.getVideoLoadedFraction();
        
        setProgress(currentTime);
        setDuration(duration);
        setLoaded(loadedFraction * 100);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [playerState, setProgress, setDuration, setLoaded]);

  // Handle volume changes
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setVolume(muted ? 0 : volume * 100);
    }
  }, [volume, muted]);

  // Handle play/pause
  useEffect(() => {
    if (!playerRef.current) return;
    
    if (playerState === "playing") {
      playerRef.current.playVideo();
    } else if (playerState === "paused") {
      playerRef.current.pauseVideo();
    }
  }, [playerState]);

  const onReady = useCallback((event: YouTubeEvent) => {
    playerRef.current = event.target;
    playerRef.current.setVolume(muted ? 0 : volume * 100);
    
    // Register player ref
    setPlayerRef({
      seekTo: (seconds: number) => {
        if (playerRef.current) {
          playerRef.current.seekTo(seconds, true);
        }
      },
    });
    
    event.target.playVideo();
  }, [volume, muted, setPlayerRef]);

  const onStateChange = useCallback((event: YouTubeEvent) => {
    const state = event.data;
    // YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
    switch (state) {
      case 1: // PLAYING
        setPlayerState("playing");
        break;
      case 2: // PAUSED
        setPlayerState("paused");
        break;
      case 0: // ENDED
        setPlayerState("ended");
        playNext();
        break;
      case 3: // BUFFERING
        setPlayerState("buffering");
        break;
    }
  }, [setPlayerState, playNext]);

  const onError = useCallback(() => {
    // Skip to next song on error
    playNext();
  }, [playNext]);

  if (!currentSong || currentSong.type !== "youtube" || !currentSong.videoId) {
    return (
      <div className="aspect-video w-full flex items-center justify-center" style={{ background: "var(--col-bg-light)" }}>
        <p className="text-gray-500 text-sm">No video selected</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-black overflow-hidden">
      <YouTube
        videoId={currentSong.videoId}
        opts={{
          width: "100%",
          height: "100%",
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            iv_load_policy: 3,
            modestbranding: 1,
            rel: 0,
            showinfo: 0,
          },
        }}
        onReady={onReady}
        onStateChange={onStateChange}
        onError={onError}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
