import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song, PlayerState, TabType, SortMethod, TimeFilter, PlayerStore } from "./types";
import { shuffleArray } from "./utils";

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      // Playlist
      playlist: [],
      originalPlaylist: [],
      currentIndex: -1,
      currentSong: null,
      isShuffled: false,

      // Player state
      playerState: "idle",
      volume: 0.8,
      muted: false,
      progress: 0,
      duration: 0,
      loaded: 0,

      // UI state
      activeTab: "browse",
      selectedSubreddits: ["listentothis"],
      sortMethod: "hot",
      timeFilter: "month",
      isLoading: false,
      error: null,

      // Pagination
      after: null,
      hasMore: true,

      // YouTube player reference for seeking
      playerRef: null,

      // Actions
      setPlaylist: (songs: Song[]) =>
        set({
          playlist: songs,
          originalPlaylist: songs,
          currentIndex: songs.length > 0 ? 0 : -1,
          currentSong: songs.length > 0 ? songs[0] : null,
          after: null,
          hasMore: true,
          isShuffled: false,
        }),

      addToPlaylist: (songs: Song[]) =>
        set((state) => ({
          playlist: [...state.playlist, ...songs],
          originalPlaylist: [...state.originalPlaylist, ...songs],
          hasMore: songs.length > 0,
        })),

      clearPlaylist: () =>
        set({
          playlist: [],
          originalPlaylist: [],
          currentIndex: -1,
          currentSong: null,
          playerState: "idle",
          progress: 0,
          duration: 0,
          isShuffled: false,
        }),

      playSong: (index: number) => {
        const { playlist } = get();
        if (index >= 0 && index < playlist.length) {
          set({
            currentIndex: index,
            currentSong: playlist[index],
            playerState: "playing",
            progress: 0,
            activeTab: "playlist",
          });
        }
      },

      playNext: () => {
        const { playlist, currentIndex } = get();
        const nextIndex = currentIndex + 1;
        if (nextIndex < playlist.length) {
          set({
            currentIndex: nextIndex,
            currentSong: playlist[nextIndex],
            playerState: "playing",
            progress: 0,
          });
        } else {
          set({ playerState: "ended" });
        }
      },

      playPrevious: () => {
        const { playlist, currentIndex, progress } = get();
        // If more than 3 seconds in, restart current song
        if (progress > 3) {
          set({ progress: 0 });
          // Seek to start if player exists
          const { playerRef } = get();
          if (playerRef) {
            playerRef.seekTo(0);
          }
          return;
        }
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
          set({
            currentIndex: prevIndex,
            currentSong: playlist[prevIndex],
            playerState: "playing",
            progress: 0,
          });
        }
      },

      togglePlayPause: () =>
        set((state) => ({
          playerState: state.playerState === "playing" ? "paused" : "playing",
        })),

      setPlayerState: (playerState: PlayerState) => set({ playerState }),

      setVolume: (volume: number) => set({ volume: Math.max(0, Math.min(1, volume)) }),

      toggleMute: () => set((state) => ({ muted: !state.muted })),

      setProgress: (progress: number) => set({ progress }),

      setDuration: (duration: number) => set({ duration }),

      setLoaded: (loaded: number) => set({ loaded }),

      seekTo: (seconds: number) => {
        const { playerRef } = get();
        if (playerRef) {
          playerRef.seekTo(seconds);
        }
        set({ progress: seconds });
      },

      setActiveTab: (activeTab: TabType) => set({ activeTab }),

      setSelectedSubreddits: (selectedSubreddits: string[]) =>
        set({ selectedSubreddits, after: null, hasMore: true }),

      addSubreddit: (subreddit: string) =>
        set((state) => ({
          selectedSubreddits: state.selectedSubreddits.includes(subreddit)
            ? state.selectedSubreddits
            : [...state.selectedSubreddits, subreddit],
          after: null,
          hasMore: true,
        })),

      removeSubreddit: (subreddit: string) =>
        set((state) => ({
          selectedSubreddits: state.selectedSubreddits.filter((s) => s !== subreddit),
          after: null,
          hasMore: true,
        })),

      setSortMethod: (sortMethod: SortMethod) =>
        set({ sortMethod, after: null, hasMore: true }),

      setTimeFilter: (timeFilter: TimeFilter) =>
        set({ timeFilter, after: null, hasMore: true }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      setAfter: (after: string | null) => set({ after }),

      setHasMore: (hasMore: boolean) => set({ hasMore }),

      shufflePlaylist: () =>
        set((state) => {
          const shuffled = shuffleArray(state.playlist);
          const currentSong = state.currentSong;
          const newIndex = currentSong
            ? shuffled.findIndex((s) => s.id === currentSong.id)
            : 0;
          return {
            playlist: shuffled,
            currentIndex: newIndex,
            isShuffled: true,
          };
        }),

      toggleShuffle: () =>
        set((state) => {
          if (state.isShuffled) {
            // Restore original order
            const currentSong = state.currentSong;
            const newIndex = currentSong
              ? state.originalPlaylist.findIndex((s) => s.id === currentSong.id)
              : 0;
            return {
              playlist: [...state.originalPlaylist],
              currentIndex: newIndex,
              isShuffled: false,
            };
          } else {
            // Shuffle
            const shuffled = shuffleArray(state.playlist);
            const currentSong = state.currentSong;
            // Move current song to front
            if (currentSong) {
              const currentIndex = shuffled.findIndex((s) => s.id === currentSong.id);
              if (currentIndex > 0) {
                shuffled.splice(currentIndex, 1);
                shuffled.unshift(currentSong);
              }
            }
            return {
              playlist: shuffled,
              currentIndex: 0,
              isShuffled: true,
            };
          }
        }),

      setPlayerRef: (ref: { seekTo: (seconds: number) => void } | null) =>
        set({ playerRef: ref }),
    }),
    {
      name: "reddit-music-player",
      partialize: (state) => ({
        volume: state.volume,
        muted: state.muted,
        selectedSubreddits: state.selectedSubreddits,
        sortMethod: state.sortMethod,
        timeFilter: state.timeFilter,
      }),
    }
  )
);
