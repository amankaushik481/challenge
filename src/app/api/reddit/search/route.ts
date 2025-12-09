import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const type = searchParams.get("type") || "sr"; // sr = subreddit
  const limit = searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: "Query is required" },
      { status: 400 }
    );
  }

  const url = `${REDDIT_BASE_URL}/subreddits/search.json?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Extract just the subreddit names
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

