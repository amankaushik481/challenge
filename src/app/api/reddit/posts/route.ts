import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const subreddits = searchParams.get("subreddits") || "listentothis";
  const sort = searchParams.get("sort") || "hot";
  const t = searchParams.get("t") || "month";
  const after = searchParams.get("after") || "";
  const limit = searchParams.get("limit") || "25";

  let url = `${REDDIT_BASE_URL}/r/${subreddits}/${sort}.json?limit=${limit}&raw_json=1`;

  if (sort === "top") {
    url += `&t=${t}`;
  }

  if (after) {
    url += `&after=${after}`;
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
      },
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
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

