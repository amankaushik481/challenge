// Reddit API Types
export interface RedditPost {
  id: string;
  name: string; // fullname like t3_xxxxx
  title: string;
  author: string;
  subreddit: string;
  subreddit_name_prefixed: string;
  url: string;
  permalink: string;
  thumbnail: string;
  score: number;
  ups: number;
  downs: number;
  num_comments: number;
  created_utc: number;
  is_video: boolean;
  media: {
    oembed?: {
      title?: string;
      author_name?: string;
      thumbnail_url?: string;
      url?: string;
    };
    reddit_video?: {
      fallback_url?: string;
    };
  } | null;
  preview?: {
    images: Array<{
      source: { url: string; width: number; height: number };
      resolutions: Array<{ url: string; width: number; height: number }>;
    }>;
  };
  selftext?: string;
  domain: string;
  over_18: boolean;
  stickied: boolean;
}

export interface RedditComment {
  id: string;
  name: string;
  author: string;
  body: string;
  body_html: string;
  score: number;
  ups: number;
  downs: number;
  created_utc: number;
  permalink: string;
  subreddit: string;
  replies?: {
    data: {
      children: Array<{ data: RedditComment }>;
    };
  } | string;
  is_submitter: boolean;
  depth: number;
}

export interface RedditListing<T> {
  kind: string;
  data: {
    after: string | null;
    before: string | null;
    children: Array<{ kind: string; data: T }>;
    dist: number;
  };
}

// Song Types
export type SongType = "youtube" | "vimeo" | "soundcloud" | "mp3" | "none";

export interface Song {
  id: string;
  redditId: string;
  title: string;
  author: string;
  subreddit: string;
  url: string;
  permalink: string;
  thumbnail: string;
  score: number;
  numComments: number;
  createdUtc: number;
  createdAgo: string;
  type: SongType;
  playable: boolean;
  videoId?: string; // YouTube/Vimeo video ID
  mediaUrl?: string; // Direct media URL for MP3/SoundCloud
}

// Subreddit Categories
export interface SubredditCategory {
  name: string;
  subreddits: string[];
  icon?: string;
  color?: string;
}

// Player State
export type PlayerState = "idle" | "playing" | "paused" | "buffering" | "ended";

export type SortMethod = "hot" | "new" | "top";
export type TimeFilter = "hour" | "day" | "week" | "month" | "year" | "all";

// Tab Navigation
export type TabType = "browse" | "playlist" | "song";

// Player Reference Interface
export interface PlayerRef {
  seekTo: (seconds: number) => void;
}

// Store Types
export interface PlayerStore {
  // Playlist
  playlist: Song[];
  originalPlaylist: Song[];
  currentIndex: number;
  currentSong: Song | null;
  isShuffled: boolean;
  
  // Player state
  playerState: PlayerState;
  volume: number;
  muted: boolean;
  progress: number;
  duration: number;
  loaded: number;
  
  // UI state
  activeTab: TabType;
  selectedSubreddits: string[];
  sortMethod: SortMethod;
  timeFilter: TimeFilter;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  after: string | null;
  hasMore: boolean;
  
  // Player reference
  playerRef: PlayerRef | null;
  
  // Actions
  setPlaylist: (songs: Song[]) => void;
  addToPlaylist: (songs: Song[]) => void;
  clearPlaylist: () => void;
  
  playSong: (index: number) => void;
  playNext: () => void;
  playPrevious: () => void;
  togglePlayPause: () => void;
  
  setPlayerState: (state: PlayerState) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setLoaded: (loaded: number) => void;
  seekTo: (seconds: number) => void;
  
  setActiveTab: (tab: TabType) => void;
  setSelectedSubreddits: (subreddits: string[]) => void;
  addSubreddit: (subreddit: string) => void;
  removeSubreddit: (subreddit: string) => void;
  setSortMethod: (method: SortMethod) => void;
  setTimeFilter: (filter: TimeFilter) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAfter: (after: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  
  shufflePlaylist: () => void;
  toggleShuffle: () => void;
  setPlayerRef: (ref: PlayerRef | null) => void;
}
