import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

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

  // Clean the permalink - ensure it starts with /r/
  const cleanPermalink = permalink.startsWith("/r/") ? permalink : `/r/${permalink}`;
  const url = `${REDDIT_BASE_URL}${cleanPermalink}.json?sort=${sort}&raw_json=1`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RedditMusicPlayer/2.0 (Next.js)",
      },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Reddit API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Reddit returns [post, comments]
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

