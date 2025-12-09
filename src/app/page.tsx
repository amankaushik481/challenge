"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
  Loader2,
  Search,
  Plus,
  ChevronDown,
  Music,
  Headphones,
  List,
  Share2,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  ExternalLink,
  Github,
  User,
  Wifi,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { YouTubePlayer } from "@/components/player/YouTubePlayer";
import { usePlayerStore } from "@/lib/store";
import { fetchSubredditPosts, fetchPostComments } from "@/lib/reddit";
import { subredditCategories } from "@/data/subreddits";
import { formatTime, cn } from "@/lib/utils";
import type { Song, SortMethod, TimeFilter, RedditComment } from "@/lib/types";

type PanelType = "browse" | "playlist" | "song";

export default function Home() {
  const [activePanel, setActivePanel] = useState<PanelType>("playlist");
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customSubreddit, setCustomSubreddit] = useState("");
  const [showTopDropdown, setShowTopDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const {
    playlist,
    currentIndex,
    currentSong,
    playerState,
    volume,
    muted,
    progress,
    duration,
    selectedSubreddits,
    sortMethod,
    timeFilter,
    after,
    isLoading,
    hasMore,
    isShuffled,
    setLoading,
    setError,
    setPlaylist,
    addToPlaylist,
    setAfter,
    playSong,
    playNext,
    playPrevious,
    togglePlayPause,
    setVolume,
    toggleMute,
    shufflePlaylist,
    toggleShuffle,
    addSubreddit,
    removeSubreddit,
    setSortMethod,
    setTimeFilter,
    seekTo,
  } = usePlayerStore();

  const isPlaying = playerState === "playing";
  const isBuffering = playerState === "buffering";

  // Fetch posts
  const fetchPosts = useCallback(
    async (loadMore = false) => {
      if (selectedSubreddits.length === 0) return;

      try {
        if (loadMore) {
          setIsLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const { posts, after: newAfter } = await fetchSubredditPosts(
          selectedSubreddits,
          sortMethod,
          timeFilter,
          loadMore ? after : null
        );

        if (loadMore) {
          addToPlaylist(posts);
        } else {
          setPlaylist(posts);
        }
        setAfter(newAfter);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to fetch posts");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedSubreddits, sortMethod, timeFilter, after, setLoading, setError, setPlaylist, addToPlaylist, setAfter]
  );

  // Fetch comments when song changes
  useEffect(() => {
    if (currentSong) {
      setIsLoadingComments(true);
      fetchPostComments(currentSong.subreddit, currentSong.id)
        .then(setComments)
        .catch(() => setComments([]))
        .finally(() => setIsLoadingComments(false));
    }
  }, [currentSong?.id]);

  // Initial fetch
  useEffect(() => {
    if (selectedSubreddits.length > 0 && playlist.length === 0) {
      fetchPosts();
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

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
          toggleShuffle();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlayPause, playNext, playPrevious, setVolume, toggleMute, toggleShuffle, volume]);

  const handleSubredditToggle = useCallback(
    (subreddit: string) => {
      if (selectedSubreddits.includes(subreddit)) {
        removeSubreddit(subreddit);
      } else {
        addSubreddit(subreddit);
      }
    },
    [selectedSubreddits, addSubreddit, removeSubreddit]
  );

  const handleAddCustom = useCallback(() => {
    if (customSubreddit.trim()) {
      const sub = customSubreddit.trim().replace(/^r\//, "");
      addSubreddit(sub);
      setCustomSubreddit("");
      fetchPosts();
    }
  }, [customSubreddit, addSubreddit, fetchPosts]);

  const handleSortChange = useCallback(
    (method: SortMethod, time?: TimeFilter) => {
      setSortMethod(method);
      if (time) setTimeFilter(time);
      setShowTopDropdown(false);
      setTimeout(() => fetchPosts(), 0);
    },
    [setSortMethod, setTimeFilter, fetchPosts]
  );

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || duration === 0) return;
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      seekTo(percent * duration);
    },
    [duration, seekTo]
  );

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Filter categories based on search
  const filteredCategories = subredditCategories
    .map((category) => ({
      ...category,
      subreddits: searchQuery
        ? category.subreddits.filter((sub) => sub.toLowerCase().includes(searchQuery.toLowerCase()))
        : category.subreddits,
    }))
    .filter((category) => category.subreddits.length > 0);

  const timeFilterLabels: Record<TimeFilter, string> = {
    hour: "Past Hour",
    day: "Today",
    week: "This Week",
    month: "This Month",
    year: "This Year",
    all: "All Time",
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: "var(--col-bg)" }}>
      {/* Header - exact match */}
      <header
        className="h-[45px] flex items-center justify-between px-4 relative z-[10000]"
        style={{ background: "linear-gradient(to bottom, #1c1c1c, #161616)" }}
      >
        {/* Rainbow gradient at top */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-cyan-400 via-blue-500 to-purple-500" />

        <a href="/" className="flex items-center gap-1 font-[var(--font-condensed)] uppercase tracking-wide">
          <span className="text-[var(--col-gold)] font-light text-sm">Music</span>
          <span className="text-white font-normal text-sm"> Player </span>
          <span className="text-[var(--col-gold)] font-light text-sm"> for </span>
          <span className="text-white font-normal text-sm">Reddit</span>
          <sup className="text-[10px] text-gray-500 ml-1">2.0</sup>
        </a>

        <div className="flex items-center gap-2">
          {/* Menu Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white"
            >
              Menu
              <ChevronDown className="h-3 w-3" />
            </button>
            {showMenuDropdown && (
              <div
                className="absolute right-0 top-full mt-1 w-48 py-1 rounded shadow-lg z-50"
                style={{ background: "rgba(59, 59, 59, 0.95)" }}
              >
                <button
                  onClick={() => {
                    setActivePanel("playlist");
                    setShowMenuDropdown(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#fdffe8] hover:bg-[rgba(71,71,71,0.95)]"
                >
                  <Headphones className="h-4 w-4" />
                  Playlist
                </button>
                <a
                  href="https://github.com/musicplayer-io/redditmusicplayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#fdffe8] hover:bg-[rgba(71,71,71,0.95)]"
                >
                  <Github className="h-4 w-4" />
                  Source Code
                </a>
                <a
                  href="https://www.reddit.com/r/musicplayer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#fdffe8] hover:bg-[rgba(71,71,71,0.95)]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Reddit
                </a>
              </div>
            )}
          </div>

          <a
            href="/login"
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white"
          >
            <User className="h-4 w-4" />
            Log In
          </a>
        </div>
      </header>

      {/* Mobile Tab Bar */}
      <div
        className="h-[45px] flex lg:hidden"
        style={{ background: "var(--col-bg-light)" }}
      >
        <button
          onClick={() => setActivePanel("browse")}
          className={cn(
            "flex-1 text-center py-3 text-sm capitalize transition-colors",
            activePanel === "browse" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Browse
        </button>
        <button
          onClick={() => setActivePanel("playlist")}
          className={cn(
            "flex-1 text-center py-3 text-sm capitalize transition-colors",
            activePanel === "playlist" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Playlist
        </button>
        <button
          onClick={() => setActivePanel("song")}
          className={cn(
            "flex-1 text-center py-3 text-sm capitalize transition-colors",
            activePanel === "song" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
          )}
        >
          Song
        </button>
      </div>

      {/* Main Content - 3 Columns */}
      <div className="flex-1 flex overflow-hidden">
        {/* Browse Panel - 33.33% */}
        <div
          className={cn(
            "w-full lg:w-1/3 overflow-hidden flex flex-col",
            activePanel !== "browse" && "hidden lg:flex"
          )}
          style={{ background: "var(--col-bg)" }}
        >
          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Switcher Header */}
              <div className="switcher-header flex items-center gap-2 mb-4">
                <List className="h-4 w-4" />
                <span className="text-sm">Browse Subreddits</span>
              </div>

              {/* Search Reddit */}
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Search Reddit"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 text-sm"
                />
                <button className="btn-gold px-3 py-2 rounded text-sm">
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* My Subreddit Playlist */}
              {selectedSubreddits.length > 0 && (
                <div className="mb-4 p-3 rounded" style={{ background: "var(--col-bg-light)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="h-4 w-4 cursor-pointer hover:text-[var(--col-gold)]" />
                    <span className="text-sm">My Subreddit Playlist</span>
                  </div>
                  <div className="space-y-1">
                    {selectedSubreddits.map((sub) => (
                      <div
                        key={sub}
                        onClick={() => handleSubredditToggle(sub)}
                        className="flex items-center justify-between px-2 py-1 text-sm cursor-pointer rounded hover:bg-[rgba(255,255,255,0.05)] subreddit-item active"
                      >
                        <span>{sub}</span>
                        <span className="text-red-500 text-xs">×</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => fetchPosts()}
                    className="btn-gold w-full mt-2 py-2 rounded text-sm font-medium"
                  >
                    Load Playlist
                  </button>
                </div>
              )}

              {/* Custom Subreddit */}
              <div className="flex gap-2 mb-4">
                <span className="text-white py-2 text-sm">/r/</span>
                <input
                  type="text"
                  placeholder="custom-subreddit"
                  value={customSubreddit}
                  onChange={(e) => setCustomSubreddit(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                  className="flex-1 text-sm"
                />
                <button onClick={handleAddCustom} className="btn-gold px-3 py-2 rounded text-sm">
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Subreddit Categories */}
              {filteredCategories.map((category) => (
                <div key={category.name} className="mb-4">
                  <div className="p-2 rounded" style={{ background: "var(--col-bg-light)" }}>
                    <h3 className="text-sm font-normal mb-2 px-2">{category.name}</h3>
                    <div className="space-y-0.5">
                      {category.subreddits.map((sub) => {
                        const isSelected = selectedSubreddits.includes(sub);
                        return (
                          <div
                            key={sub}
                            onClick={() => handleSubredditToggle(sub)}
                            className={cn(
                              "flex items-center justify-between px-3 py-1.5 text-sm cursor-pointer rounded transition-all subreddit-item",
                              isSelected && "active"
                            )}
                          >
                            <span>{sub}</span>
                            {!isSelected && (
                              <Plus className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Playlist Panel - 33.33% */}
        <div
          className={cn(
            "w-full lg:w-1/3 overflow-hidden flex flex-col",
            activePanel !== "playlist" && "hidden lg:flex"
          )}
          style={{ background: "var(--col-bg)" }}
        >
          <div className="p-4 pb-0">
            {/* Switcher Header */}
            <div className="switcher-header flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4" />
                <span className="text-sm">Playlist</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleShuffle}
                  className={cn("p-2 rounded hover:bg-[rgba(255,255,255,0.1)]", isShuffled && "shuffle-active")}
                  title="Shuffle Playlist"
                >
                  <Shuffle className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Sort Methods */}
            <div className="flex mb-4" style={{ background: "var(--col-bg-light)" }}>
              <button
                onClick={() => handleSortChange("hot")}
                className={cn(
                  "flex-1 py-2 text-sm text-center transition-colors",
                  sortMethod === "hot" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
                )}
              >
                Hot
              </button>
              <button
                onClick={() => handleSortChange("new")}
                className={cn(
                  "flex-1 py-2 text-sm text-center transition-colors",
                  sortMethod === "new" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
                )}
              >
                New
              </button>
              <button
                onClick={() => handleSortChange("top")}
                className={cn(
                  "flex-1 py-2 text-sm text-center transition-colors",
                  sortMethod === "top" ? "bg-[var(--col-bg-lighter)] text-white" : "text-gray-400 hover:text-white"
                )}
              >
                Top
              </button>
              {/* Time Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTopDropdown(!showTopDropdown)}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-[rgba(255,255,255,0.1)]"
                >
                  {timeFilterLabels[timeFilter]}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showTopDropdown && (
                  <div
                    className="absolute right-0 top-full mt-1 w-32 py-1 rounded shadow-lg z-50"
                    style={{ background: "rgba(59, 59, 59, 0.95)" }}
                  >
                    {(Object.entries(timeFilterLabels) as [TimeFilter, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        onClick={() => handleSortChange("top", value)}
                        className={cn(
                          "w-full px-4 py-2 text-sm text-left text-[#fdffe8] hover:bg-[rgba(71,71,71,0.95)]",
                          timeFilter === value && "dropdown-item-active"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Playlist Items */}
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm">Getting some songs... Hold tight!</span>
              </div>
            ) : playlist.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500">
                <p className="text-sm">Select subreddits to load music</p>
              </div>
            ) : (
              <div>
                {playlist.map((song, index) => (
                  <div
                    key={song.id}
                    onClick={() => {
                      playSong(index);
                      setActivePanel("song");
                    }}
                    className={cn(
                      "flex items-start gap-3 p-3 cursor-pointer transition-colors menu-item-hover",
                      index === currentIndex && "playlist-item-active border-active",
                      song.type === "youtube" && "border-youtube",
                      song.type === "soundcloud" && "border-soundcloud",
                      song.type === "vimeo" && "border-vimeo"
                    )}
                  >
                    {/* Thumbnail */}
                    <div className="relative w-20 h-14 flex-shrink-0 bg-black rounded overflow-hidden">
                      <Image
                        src={song.thumbnail}
                        alt={song.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-music.svg";
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm leading-tight mb-1 line-clamp-2">{song.title}</p>
                      <p className="text-xs">
                        <span className="upvote-color">{song.score}</span>
                        <span className="text-gray-500"> • </span>
                        <span className="author-link">{song.author}</span>
                        <span className="text-gray-500"> in </span>
                        <span className="author-link">{song.subreddit}</span>
                        <span className="text-gray-500"> • </span>
                        <span className="date-color">{song.createdAgo}</span>
                        <span className="text-gray-500"> • </span>
                        <span className="text-gray-400">{song.numComments} 💬</span>
                      </p>
                    </div>
                  </div>
                ))}

                {/* Load More */}
                {hasMore && (
                  <div
                    onClick={() => fetchPosts(true)}
                    className="flex items-center justify-center gap-2 p-4 cursor-pointer text-gray-400 hover:text-white"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm">Loading more...</span>
                      </>
                    ) : (
                      <span className="text-sm">Load more songs</span>
                    )}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Song Panel - 33.33% */}
        <div
          className={cn(
            "w-full lg:w-1/3 overflow-hidden flex flex-col",
            activePanel !== "song" && "hidden lg:flex"
          )}
          style={{ background: "var(--col-bg)" }}
        >
          <ScrollArea className="flex-1">
            <div className="p-4">
              {/* Switcher Header */}
              <div className="switcher-header flex items-center gap-2 mb-4 desktop-only">
                <Music className="h-4 w-4" />
                <span className="text-sm">Current Song</span>
              </div>

              {/* Video Player */}
              <div className="mb-4">
                <YouTubePlayer />
              </div>

              {/* Current Song Info */}
              {currentSong && (
                <div className="p-4 rounded mb-4" style={{ background: "var(--col-bg-light)" }}>
                  <h2 className="text-white text-center text-lg font-light mb-4">{currentSong.title}</h2>

                  {/* Stats */}
                  <div className="flex justify-center gap-8 mb-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1">
                        <ArrowUp className="h-4 w-4 upvote-color cursor-pointer hover:opacity-70" />
                        <span className="upvote-color">{currentSong.score}</span>
                      </div>
                      <span className="text-xs text-gray-500">Score</span>
                    </div>
                    <div className="text-center">
                      <div className="author-link">{currentSong.author}</div>
                      <span className="text-xs text-gray-500">Author</span>
                    </div>
                    <div className="text-center">
                      <div className="author-link">{currentSong.subreddit}</div>
                      <span className="text-xs text-gray-500">Subreddit</span>
                    </div>
                    <div className="text-center">
                      <div className="date-color">{currentSong.createdAgo}</div>
                      <span className="text-xs text-gray-500">Posted</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-center gap-4">
                    <a
                      href={currentSong.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold px-4 py-2 rounded text-sm flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View on Reddit
                    </a>
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <div className="p-4 rounded" style={{ background: "var(--col-bg-light)" }}>
                <h2 className="text-white text-lg font-light mb-4">
                  <span className="text-gray-400">{comments.length}</span> Comments
                </h2>

                {isLoadingComments ? (
                  <div className="flex items-center justify-center py-8 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span className="text-sm">Loading comments...</span>
                  </div>
                ) : comments.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">No comments yet</p>
                ) : (
                  <div className="space-y-3">
                    {comments.slice(0, 20).map((comment) => (
                      <div key={comment.id} className="comment-item p-3 rounded">
                        <div className="flex gap-2">
                          {/* Vote buttons */}
                          <div className="flex flex-col items-center gap-1">
                            <ArrowUp className="h-3 w-3 cursor-pointer hover:text-[var(--col-upvote)]" />
                            <ArrowDown className="h-3 w-3 cursor-pointer hover:text-[var(--col-downvote)]" />
                          </div>
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="author-link text-sm">{comment.author}</span>
                              <span className="comment-metadata text-xs">{comment.score} points</span>
                            </div>
                            <div
                              className="comment-text text-sm"
                              dangerouslySetInnerHTML={{ __html: comment.body_html || comment.body }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <div className="mt-4">
                  <textarea
                    placeholder="Add a comment..."
                    className="w-full p-3 rounded text-sm resize-none"
                    style={{ background: "rgba(255,255,255,0.1)", color: "white" }}
                    rows={3}
                  />
                  <button className="btn-gold w-full mt-2 py-2 rounded text-sm flex items-center justify-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Add Comment
                  </button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Bottom Controls - exact match */}
      <div
        className="h-[45px] flex items-center px-2"
        style={{ background: "var(--col-bg-light)" }}
      >
        {/* Left - Playback Controls */}
        <div className="flex items-center">
          <button
            onClick={playPrevious}
            disabled={!currentSong}
            className="control-button disabled:opacity-30"
          >
            <SkipBack className="h-5 w-5" />
          </button>
          <button
            onClick={togglePlayPause}
            disabled={!currentSong}
            className={cn("control-button disabled:opacity-30", isPlaying && "active")}
          >
            {isBuffering ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={playNext}
            disabled={!currentSong}
            className="control-button disabled:opacity-30"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        {/* Middle - Progress */}
        <div className="flex-1 flex items-center gap-2 px-4">
          <span className="text-xs text-gray-400 w-12 text-right font-mono">{formatTime(progress)}</span>
          <div
            ref={progressRef}
            onClick={handleProgressClick}
            className="progress-bar flex-1 relative"
          >
            <div className="progress-loaded" style={{ width: "100%" }} />
            <div className="progress-current" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs text-gray-400 w-12 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Right - Volume */}
        <div className="flex items-center">
          <button onClick={toggleMute} className="control-button">
            {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
