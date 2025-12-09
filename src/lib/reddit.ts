import type { RedditPost, RedditListing, RedditComment, Song, SortMethod, TimeFilter } from "./types";
import { getSongType, extractYouTubeId, extractVimeoId, getYouTubeThumbnail, timeSince, cleanTitle, isPlayableUrl } from "./utils";

const REDDIT_BASE_URL = "https://www.reddit.com";

// Check if we're on the client side
const isClient = typeof window !== "undefined";

// Fetch posts from subreddit(s) - uses API proxy on client, direct on server
export async function fetchSubredditPosts(
  subreddits: string[],
  sort: SortMethod = "hot",
  timeFilter: TimeFilter = "month",
  after?: string | null,
  limit: number = 25
): Promise<{ posts: Song[]; after: string | null }> {
  const subredditPath = subreddits.join("+");
  
  let url: string;
  
  if (isClient) {
    // Use our API proxy on client to avoid CORS
    url = `/api/reddit/posts?subreddits=${encodeURIComponent(subredditPath)}&sort=${sort}&limit=${limit}`;
    if (sort === "top") {
      url += `&t=${timeFilter}`;
    }
    if (after) {
      url += `&after=${encodeURIComponent(after)}`;
    }
  } else {
    // Direct fetch on server (no CORS issues)
    url = `${REDDIT_BASE_URL}/r/${subredditPath}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === "top") {
      url += `&t=${timeFilter}`;
    }
    if (after) {
      url += `&after=${after}`;
    }
  }

  try {
    const fetchOptions: RequestInit = isClient 
      ? {} 
      : {
          headers: {
            "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
          },
          next: { revalidate: 60 },
        };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data: RedditListing<RedditPost> = await response.json();
    
    const posts = data.data.children
      .map((child) => child.data)
      .filter((post) => isPlayableUrl(post.url) && !post.over_18 && !post.stickied)
      .map((post) => redditPostToSong(post));

    return {
      posts,
      after: data.data.after,
    };
  } catch (error) {
    console.error("Error fetching subreddit posts:", error);
    throw error;
  }
}

// Fetch comments for a post
export async function fetchPostComments(
  subreddit: string,
  postId: string,
  sort: string = "best"
): Promise<RedditComment[]> {
  let url: string;
  
  if (isClient) {
    // Use our API proxy on client
    url = `/api/reddit/comments?permalink=${encodeURIComponent(`/r/${subreddit}/comments/${postId}`)}&sort=${sort}`;
  } else {
    url = `${REDDIT_BASE_URL}/r/${subreddit}/comments/${postId}.json?sort=${sort}&raw_json=1`;
  }

  try {
    const fetchOptions: RequestInit = isClient 
      ? {} 
      : {
          headers: {
            "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
          },
          next: { revalidate: 60 },
        };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    if (isClient && data.comments) {
      // Our API proxy returns { post, comments }
      const commentsListing = data.comments as RedditListing<RedditComment>;
      return commentsListing.data.children
        .filter((child) => child.kind === "t1")
        .map((child) => child.data);
    }
    
    // Direct Reddit response: [post, comments]
    if (Array.isArray(data) && data.length >= 2) {
      const commentsListing = data[1] as RedditListing<RedditComment>;
      return commentsListing.data.children
        .filter((child) => child.kind === "t1")
        .map((child) => child.data);
    }
    
    return [];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
}

// Search subreddits
export async function searchSubreddits(query: string): Promise<string[]> {
  if (!query.trim()) return [];
  
  let url: string;
  
  if (isClient) {
    url = `/api/reddit/search?q=${encodeURIComponent(query)}&limit=10`;
  } else {
    url = `${REDDIT_BASE_URL}/subreddits/search.json?q=${encodeURIComponent(query)}&type=sr&limit=10`;
  }

  try {
    const fetchOptions: RequestInit = isClient 
      ? {} 
      : {
          headers: {
            "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
          },
        };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      throw new Error(`Reddit API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle our API response format
    if (data.subreddits) {
      return data.subreddits.map((sub: { name: string }) => sub.name);
    }
    
    // Handle direct Reddit response
    return data.data.children.map((child: { data: { display_name: string } }) => 
      child.data.display_name
    );
  } catch (error) {
    console.error("Error searching subreddits:", error);
    return [];
  }
}

// Convert Reddit post to Song
function redditPostToSong(post: RedditPost): Song {
  const type = getSongType(post.url);
  const createdDate = new Date(post.created_utc * 1000);
  
  let videoId: string | undefined;
  let thumbnail = post.thumbnail;
  
  if (type === "youtube") {
    videoId = extractYouTubeId(post.url) || undefined;
    if (videoId) {
      thumbnail = getYouTubeThumbnail(videoId, "hq");
    }
  } else if (type === "vimeo") {
    videoId = extractVimeoId(post.url) || undefined;
  }
  
  // Fallback thumbnail
  if (!thumbnail || thumbnail === "default" || thumbnail === "self" || thumbnail === "nsfw") {
    if (post.preview?.images?.[0]?.source?.url) {
      thumbnail = post.preview.images[0].source.url;
    } else if (videoId && type === "youtube") {
      thumbnail = getYouTubeThumbnail(videoId, "hq");
    } else {
      thumbnail = "/placeholder-music.svg";
    }
  }

  return {
    id: post.id,
    redditId: post.name,
    title: cleanTitle(post.title),
    author: post.author,
    subreddit: post.subreddit,
    url: post.url,
    permalink: `${REDDIT_BASE_URL}${post.permalink}`,
    thumbnail,
    score: post.score,
    numComments: post.num_comments,
    createdUtc: post.created_utc,
    createdAgo: timeSince(createdDate),
    type,
    playable: type !== "none",
    videoId,
    mediaUrl: type === "mp3" || type === "soundcloud" ? post.url : undefined,
  };
}
