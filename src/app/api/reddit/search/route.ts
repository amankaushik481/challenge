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
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "sr";
  const limit = searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

  const queryParams = `q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;

  // Try OAuth API first
  const accessToken = await getRedditAccessToken();

  if (accessToken) {
    try {
      const oauthUrl = `${REDDIT_OAUTH_URL}/subreddits/search?${queryParams}`;
      const response = await fetch(oauthUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "User-Agent": "RedditMusicPlayer/2.0",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        const subreddits = data.data.children.map((child: { data: { display_name: string; subscribers: number; public_description: string } }) => ({
          name: child.data.display_name,
          subscribers: child.data.subscribers,
          description: child.data.public_description,
        }));
        return NextResponse.json({ subreddits });
      }
    } catch (error) {
      console.error("OAuth API failed for search:", error);
    }
  }

  // Fallback to public API
  const publicUrl = `${REDDIT_PUBLIC_URL}/subreddits/search.json?${queryParams}`;

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
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const subreddits = data.data.children.map((child: { data: { display_name: string; subscribers: number; public_description: string } }) => ({
      name: child.data.display_name,
      subscribers: child.data.subscribers,
      description: child.data.public_description,
    }));

    return NextResponse.json({ subreddits });
  } catch (error) {
    console.error("Error searching Reddit:", error);
    return NextResponse.json(
      { error: "Failed to search Reddit" },
      { status: 500 }
    );
  }
}
