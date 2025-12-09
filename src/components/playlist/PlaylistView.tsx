"use client";

import { useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Play, Pause, MessageCircle, ArrowUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePlayerStore } from "@/lib/store";
import { formatNumber, cn } from "@/lib/utils";
import type { Song } from "@/lib/types";

interface SongItemProps {
  song: Song;
  index: number;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: (index: number) => void;
}

function SongItem({ song, index, isActive, isPlaying, onPlay }: SongItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer hover-lift",
        isActive
          ? "song-active bg-primary/10"
          : "hover:bg-surface-hover"
      )}
      onClick={() => onPlay(index)}
    >
      {/* Thumbnail */}
      <div className="relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 bg-muted">
        <Image
          src={song.thumbnail}
          alt={song.title}
          fill
          className="object-cover"
          sizes="56px"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/placeholder-music.png";
          }}
        />
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-black/50 transition-opacity",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {isActive && isPlaying ? (
            <Pause className="h-6 w-6 text-white" />
          ) : (
            <Play className="h-6 w-6 text-white ml-0.5" />
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium text-sm truncate",
          isActive && "text-primary"
        )}>
          {song.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">r/{song.subreddit}</span>
          <span>•</span>
          <span>{song.createdAgo}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
        <div className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3" />
          <span>{formatNumber(song.score)}</span>
        </div>
        <div className="flex items-center gap-1">
          <MessageCircle className="h-3 w-3" />
          <span>{formatNumber(song.numComments)}</span>
        </div>
        <Badge variant="glow" className="text-[10px] px-1.5">
          {song.type.toUpperCase()}
        </Badge>
      </div>
    </motion.div>
  );
}

interface PlaylistViewProps {
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function PlaylistView({ onLoadMore, isLoadingMore }: PlaylistViewProps) {
  const {
    playlist,
    currentIndex,
    playerState,
    hasMore,
    playSong,
  } = usePlayerStore();

  const handlePlay = useCallback(
    (index: number) => {
      playSong(index);
    },
    [playSong]
  );

  if (playlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <p className="text-lg font-medium">No songs in playlist</p>
        <p className="text-sm">Browse subreddits to add music</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-400px)] pr-2">
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {playlist.map((song, index) => (
            <SongItem
              key={song.id}
              song={song}
              index={index}
              isActive={index === currentIndex}
              isPlaying={index === currentIndex && playerState === "playing"}
              onPlay={handlePlay}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center py-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </ScrollArea>
  );
}

