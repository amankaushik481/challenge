# Reddit Music Player - Next.js Rebuild Plan

## 🎯 Project Overview

Rebuilding the Reddit Music Player from CoffeeScript/Backbone.js to a modern **Next.js 16 (App Router) + shadcn/ui** stack.

**Live Reference:** https://reddit.musicplayer.io  
**Original Repo:** redditmusicplayer

---

## 📋 Phase Checklist

### Phase 1: Project Setup ✅
- [ ] Initialize Next.js 16 project with App Router
- [ ] Install and configure shadcn/ui
- [ ] Set up Tailwind CSS with custom theme
- [ ] Configure TypeScript
- [ ] Set up project structure
- [ ] Install required dependencies (react-youtube, etc.)

### Phase 2: Core Infrastructure 🔧
- [ ] Create Reddit API integration (server actions)
- [ ] Set up YouTube/media player components
- [ ] Create state management (Zustand)
- [ ] Build reusable UI components
- [ ] Set up SSR for SEO

### Phase 3: Main Features 🎵
- [ ] **Browse Page** - Subreddit categories & selection
- [ ] **Playlist Page** - Queue management & song list
- [ ] **Song/Now Playing** - Comments, metadata, scores
- [ ] **Player Controls** - Play/pause, skip, volume, progress
- [ ] **Search** - Reddit search functionality

### Phase 4: Advanced Features 🚀
- [ ] Authentication (Reddit OAuth)
- [ ] Voting on posts/comments
- [ ] Comment submission
- [ ] Remote control feature
- [ ] Keyboard shortcuts

### Phase 5: Polish & Deploy 💅
- [ ] Responsive design
- [ ] Loading states & animations
- [ ] Error handling
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Testing

---

## 🏗️ Architecture

```
/app
├── layout.tsx          # Root layout with providers
├── page.tsx            # Home/Browse page (SSR)
├── playlist/
│   └── page.tsx        # Playlist view
├── song/
│   └── page.tsx        # Current song + comments
├── r/
│   └── [subreddit]/
│       └── page.tsx    # Subreddit-specific page (SEO)
├── api/
│   ├── reddit/
│   │   ├── posts/route.ts
│   │   ├── comments/route.ts
│   │   └── search/route.ts
│   └── auth/
│       └── [...nextauth]/route.ts

/components
├── ui/                 # shadcn components
├── player/
│   ├── Player.tsx      # Main player component
│   ├── Controls.tsx    # Play/pause, skip, volume
│   ├── ProgressBar.tsx # Seekable progress
│   └── YouTubeEmbed.tsx
├── playlist/
│   ├── PlaylistView.tsx
│   ├── SongItem.tsx
│   └── SortControls.tsx
├── browse/
│   ├── SubredditGrid.tsx
│   ├── CategorySection.tsx
│   └── SearchBar.tsx
├── song/
│   ├── CurrentSong.tsx
│   ├── CommentsView.tsx
│   └── VoteButtons.tsx
└── layout/
    ├── Header.tsx
    ├── TabNavigation.tsx
    └── MobileBar.tsx

/lib
├── reddit.ts           # Reddit API functions
├── youtube.ts          # YouTube URL parsing
├── store.ts            # Zustand store
├── types.ts            # TypeScript interfaces
└── utils.ts            # Utility functions

/data
└── subreddits.ts       # Categorized subreddit list
```

---

## 🎨 Design System

### Typography
- **Primary Font:** "Satoshi" (distinctive, modern)
- **Monospace:** "JetBrains Mono" (for metadata)

### Color Palette (Dark Theme - "Midnight Vibes")
```css
:root {
  --background: 222 47% 5%;        /* Deep navy black */
  --foreground: 210 40% 96%;       /* Soft white */
  --card: 222 47% 8%;              /* Elevated surface */
  --card-foreground: 210 40% 96%;
  --primary: 339 90% 51%;          /* Hot pink/magenta accent */
  --primary-foreground: 0 0% 100%;
  --secondary: 217 33% 17%;        /* Muted blue-gray */
  --accent: 47 100% 50%;           /* Golden yellow */
  --muted: 217 33% 17%;
  --muted-foreground: 215 20% 65%;
  --border: 217 33% 17%;
  --ring: 339 90% 51%;
}
```

### Visual Effects
- Glassmorphism cards with subtle backdrop blur
- Gradient mesh background (animated)
- Glow effects on active elements
- Smooth micro-interactions (Framer Motion)
- Staggered reveal animations on load

---

## 🔧 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| UI Library | shadcn/ui + Radix |
| Styling | Tailwind CSS v4 |
| State | Zustand |
| Animation | Framer Motion |
| YouTube | react-youtube |
| Auth | NextAuth.js |
| Icons | Lucide React |
| Fonts | next/font (Satoshi, JetBrains Mono) |

---

## 📊 Data Flow

### Reddit Post → Playable Song
1. Fetch posts from Reddit API
2. Filter for YouTube/supported media links
3. Extract video ID from URL
4. Create Song object with metadata
5. Add to playlist queue

### Song Types Supported
- YouTube (primary)
- Vimeo
- SoundCloud
- Direct MP3 links

---

## 🎵 Core Features Detail

### Player Controls
- Play/Pause toggle
- Previous/Next track
- Volume slider with mute
- Progress bar (seekable)
- Shuffle playlist
- Time display (current/total)

### Browse Subreddits
- Categorized grid (Electronic, Rock, Hip-Hop, etc.)
- Custom subreddit input
- Search Reddit
- Multi-subreddit support (r/music+listentothis)

### Playlist Management
- Sort by: Hot, New, Top (Today/Week/Month/Year/All)
- Infinite scroll (Load More)
- Click to play
- Visual active indicator
- Thumbnail previews

### Song Details
- Post title, author, score
- Upvote/downvote (authenticated)
- Comment thread (nested)
- Reply to comments
- Time since posted

---

## 🚀 SSR/SEO Strategy

### Dynamic Routes
- `/r/[subreddit]` - SEO-optimized subreddit pages
- `/r/[subreddit]/comments/[id]` - Individual post pages

### Metadata
- Dynamic OpenGraph images
- Proper title/description per page
- Structured data for music content

---

## 📱 Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Single column, bottom nav |
| Tablet (640-1024px) | Two column, side nav |
| Desktop (>1024px) | Three panel layout |

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| → | Next track |
| ← | Previous track |
| ↑ | Volume up |
| ↓ | Volume down |
| M | Mute toggle |
| S | Shuffle |

---

## 📝 Progress Log

### Session 1 - December 9, 2025
- [x] Project initialization with Next.js 16
- [x] Basic layout structure with Header, Tabs, Player
- [x] Theme configuration - "Midnight Vibes" dark theme
- [x] Zustand store setup with persistence
- [x] Reddit API integration (public endpoints)
- [x] YouTube player with react-youtube
- [x] Browse page with categorized subreddits
- [x] Playlist view with song items
- [x] Player controls (play/pause, skip, volume, progress)
- [x] Keyboard shortcuts (Space, arrows, M, S)
- [x] Sort controls (Hot, New, Top with time filters)

**Status:** ✅ Core functionality complete! App is playing music from Reddit.

---

## 🔗 API Endpoints

### Reddit (Public)
```
GET https://www.reddit.com/r/{subreddit}/{sort}.json?t={time}&limit=25&after={after}
GET https://www.reddit.com/r/{subreddit}/comments/{id}.json
GET https://www.reddit.com/search.json?q={query}&type=sr
```

### Reddit (Authenticated)
```
POST https://oauth.reddit.com/api/vote
POST https://oauth.reddit.com/api/comment
GET https://oauth.reddit.com/api/v1/me
```

---

*This document will be updated as development progresses.*

