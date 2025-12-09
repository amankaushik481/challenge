import { NextRequest, NextResponse } from "next/server";

const REDDIT_OAUTH_URL = "https://oauth.reddit.com";
const REDDIT_PUBLIC_URL = "https://www.reddit.com";

async function getRedditAccessToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;

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

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const permalink = searchParams.get("permalink");
  const sort = searchParams.get("sort") || "best";

  if (!permalink) {
    return NextResponse.json(
      { error: "Permalink is required" },
      { status: 400 }
    );
  }

  const cleanPermalink = permalink.startsWith("/r/") ? permalink : `/r/${permalink}`;

  // Try OAuth API first
  const accessToken = await getRedditAccessToken();

  if (accessToken) {
    try {
      const oauthUrl = `${REDDIT_OAUTH_URL}${cleanPermalink}?sort=${sort}&raw_json=1`;
      const response = await fetch(oauthUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "RedditMusicPlayer/2.0",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length >= 2) {
          return NextResponse.json({
            post: data[0],
            comments: data[1],
          });
        }
        return NextResponse.json(data);
      }
    } catch (error) {
      console.error("OAuth API failed for comments:", error);
    }
  }

  // Fallback to public API
  const publicUrl = `${REDDIT_PUBLIC_URL}${cleanPermalink}.json?sort=${sort}&raw_json=1`;

  try {
    const response = await fetch(publicUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Try old.reddit.com
      const oldRedditUrl = publicUrl.replace("www.reddit.com", "old.reddit.com");
      const fallbackResponse = await fetch(oldRedditUrl, {
        headers: {
          "User-Agent": getRandomUserAgent(),
          Accept: "application/json",
        },
        cache: "no-store",
      });

      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        if (Array.isArray(data) && data.length >= 2) {
          return NextResponse.json({
            post: data[0],
            comments: data[1],
          });
        }
        return NextResponse.json(data);
      }

      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length >= 2) {
      return NextResponse.json({
        post: data[0],
        comments: data[1],
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching Reddit comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments from Reddit" },
      { status: 500 }
    );
  }
}
