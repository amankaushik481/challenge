# 🎵 Reddit Music Player - Next.js 16 Rebuild

A complete rebuild of [Reddit Music Player](https://reddit.musicplayer.io) using **Next.js 16 (App Router) + shadcn/ui**.

![Reddit Music Player](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![shadcn/ui](https://img.shields.io/badge/shadcn/ui-latest-black)

## ✨ Features

All features from the original app, rebuilt with modern tech:

| Feature | Status | Description |
|---------|--------|-------------|
| **Browse Subreddits** | ✅ | Categorized subreddit browser with search |
| **Fetch Posts** | ✅ | Real-time Reddit API integration |
| **YouTube Extraction** | ✅ | Auto-extract YouTube links from posts |
| **Build Queue** | ✅ | Playlist management with queue |
| **Play Videos** | ✅ | YouTube player with controls |
| **Comments** | ✅ | Display Reddit comments with threading |
| **Metadata** | ✅ | Author, score, subreddit, timestamps |
| **Scores** | ✅ | Upvote counts displayed |
| **Navigation** | ✅ | Smooth Browse/Playlist/Song tabs |
| **Search** | ✅ | Subreddit search functionality |
| **Sorting** | ✅ | Hot/New/Top with time filters |
| **Shuffle** | ✅ | Playlist shuffle toggle |
| **Keyboard Shortcuts** | ✅ | Space, arrows, M, S keys |
| **SSR/SEO** | ✅ | Server-side rendering for SEO |
| **Mobile Responsive** | ✅ | Works on all screen sizes |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd reddit-music-player

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys (Optional)

The app works **without API keys** for basic functionality (browsing, playing).

For **full features** (voting, commenting, user auth), you need:

### Reddit API Key

1. Go to [Reddit App Preferences](https://www.reddit.com/prefs/apps)
2. Click "Create App" or "Create Another App"
3. Fill in:
   - **Name:** Reddit Music Player
   - **Type:** Web app
   - **Redirect URI:** `http://localhost:3000/api/auth/callback/reddit`
4. Copy your `client_id` and `client_secret`

### Environment Variables

Create a `.env.local` file:

```env
# Reddit OAuth (optional - for voting/commenting)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_random_secret
NEXTAUTH_URL=http://localhost:3000
```

### SoundCloud API Key (Optional)

For SoundCloud support:
1. Register at [SoundCloud Developers](https://developers.soundcloud.com/)
2. Create an app and get your Client ID
3. Add to `.env.local`:

```env
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id
```

## 🏗️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **UI Library** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS v4 |
| **State** | Zustand |
| **Player** | react-youtube |
| **Icons** | Lucide React |
| **Language** | TypeScript |

## 📁 Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main app (Browse/Playlist/Song)
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── api/
│   │   │   └── reddit/           # Reddit API proxy routes
│   │   └── r/
│   │       └── [subreddit]/      # SEO subreddit pages
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   └── player/               # YouTube player
│   ├── lib/
│   │   ├── store.ts              # Zustand store
│   │   ├── reddit.ts             # Reddit API functions
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Utilities
│   └── data/
│       └── subreddits.ts         # Subreddit categories
├── package.json
├── tsconfig.json
├── next.config.ts
└── tailwind.config.ts
```

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play/Pause |
| `→` | Next track |
| `←` | Previous track |
| `↑` | Volume up |
| `↓` | Volume down |
| `M` | Mute toggle |
| `S` | Shuffle toggle |

## 🎨 Design

The UI matches the original Reddit Music Player with:

- **Dark theme** (#111 background)
- **Gold accent** (#FDC00F)
- **Roboto font family**
- **3-panel layout** (Browse | Playlist | Song)
- **Rainbow gradient header**
- **Platform-colored borders** (YouTube red, SoundCloud orange)

## 📱 Responsive Design

| Breakpoint | Layout |
|------------|--------|
| Mobile (<768px) | Single panel with tab navigation |
| Tablet (768-1024px) | Two panels |
| Desktop (>1024px) | Three panels side-by-side |

## 🔧 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🌐 SEO Routes

- `/` - Home page
- `/r/[subreddit]` - Subreddit-specific page with metadata
- `/r/[subreddit]/comments/[postId]` - Individual post page

## 📄 License

MIT License - feel free to use this code for any purpose.

## 🙏 Credits

- Original [Reddit Music Player](https://github.com/musicplayer-io/redditmusicplayer) by Ilias Ism
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

**Built for the $1,000 bounty challenge** 🎉

