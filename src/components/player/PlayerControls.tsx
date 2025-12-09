"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { usePlayerStore } from "@/lib/store";
import { formatTime, cn } from "@/lib/utils";

export function PlayerControls() {
  const {
    currentSong,
    playerState,
    volume,
    muted,
    progress,
    duration,
    togglePlayPause,
    playNext,
    playPrevious,
    setVolume,
    toggleMute,
    shufflePlaylist,
    setProgress,
  } = usePlayerStore();

  const isPlaying = playerState === "playing";
  const isBuffering = playerState === "buffering";

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key) {
        case " ":
          e.preventDefault();
          togglePlayPause();
          break;
        case "ArrowRight":
          e.preventDefault();
          playNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          playPrevious();
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "s":
        case "S":
          shufflePlaylist();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, playNext, playPrevious, setVolume, toggleMute, shufflePlaylist, volume]);

  const handleProgressChange = useCallback(
    (value: number[]) => {
      const newProgress = (value[0] / 100) * duration;
      setProgress(newProgress);
      // Note: Actual seeking would need to be handled by the player component
    },
    [duration, setProgress]
  );

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <TooltipProvider>
      <div className="glass rounded-xl p-4 space-y-3">
        {/* Progress bar */}
        <div className="space-y-1">
          <Slider
            value={[progressPercent]}
            max={100}
            step={0.1}
            onValueChange={handleProgressChange}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-xs text-muted-foreground font-mono">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          {/* Left: Volume */}
          <div className="flex items-center gap-2 w-32">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={toggleMute}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {muted || volume === 0 ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{muted ? "Unmute (M)" : "Mute (M)"}</p>
              </TooltipContent>
            </Tooltip>
            <Slider
              value={[muted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0] / 100)}
              className="w-20"
            />
          </div>

          {/* Center: Play controls */}
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playPrevious}
                  disabled={!currentSong}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Previous (←)</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="glow"
                    size="icon-lg"
                    onClick={togglePlayPause}
                    disabled={!currentSong}
                    className={cn(
                      "rounded-full",
                      isPlaying && "animate-pulse-glow"
                    )}
                  >
                    {isBuffering ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : isPlaying ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-0.5" />
                    )}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isPlaying ? "Pause (Space)" : "Play (Space)"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={playNext}
                  disabled={!currentSong}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Next (→)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Right: Shuffle */}
          <div className="flex items-center justify-end w-32">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={shufflePlaylist}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shuffle (S)</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Current song info */}
        {currentSong && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground">
              r/{currentSong.subreddit} • {currentSong.createdAgo}
            </p>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}

