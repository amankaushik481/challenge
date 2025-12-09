import { NextRequest, NextResponse } from "next/server";

// Use Reddit's OAuth API endpoint which is more reliable for server-side requests
const REDDIT_OAUTH_URL = "https://oauth.reddit.com";
const REDDIT_PUBLIC_URL = "https://www.reddit.com";

// Get a Reddit access token using client credentials (app-only)
async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

  // If no credentials, return null to use public API
  if (!clientId || !clientSecret) {
    return null;
  }

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const response = await fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "RedditMusicPlayer/2.0",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    }
  } catch (error) {
    console.error("Failed to get Reddit access token:", error);
  }

  return null;
}

// Multiple User-Agents to rotate
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddits = searchParams.get("subreddits") || "listentothis";
  const sort = searchParams.get("sort") || "hot";
  const t = searchParams.get("t") || "month";
  const after = searchParams.get("after") || "";
  const limit = searchParams.get("limit") || "25";

  // Build query params
  let queryParams = `limit=${limit}&raw_json=1`;
  if (sort === "top") {
    queryParams += `&t=${t}`;
  }
  if (after) {
    queryParams += `&after=${after}`;
  }

  // Try OAuth API first if credentials are available
  const accessToken = await getRedditAccessToken();

  if (accessToken) {
    try {
      const oauthUrl = `${REDDIT_OAUTH_URL}/r/${subreddits}/${sort}?${queryParams}`;
      const response = await fetch(oauthUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "RedditMusicPlayer/2.0",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (error) {
      console.error("OAuth API failed, falling back to public API:", error);
    }
  }

  // Fallback to public API with browser-like headers
  const publicUrl = `${REDDIT_PUBLIC_URL}/r/${subreddits}/${sort}.json?${queryParams}`;

  try {
    const response = await fetch(publicUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua":
          '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Try old.reddit.com as last resort
      const oldRedditUrl = publicUrl.replace(
        "www.reddit.com",
        "old.reddit.com"
      );
      const fallbackResponse = await fetch(oldRedditUrl, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return NextResponse.json(data);
      }

      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Reddit posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts from Reddit" },
      { status: 500 }
    );
  }
}
