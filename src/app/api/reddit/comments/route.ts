import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

// More realistic User-Agent to avoid 403 errors
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      // Try fallback
      if (response.status === 403) {
        const fallbackUrl = url.replace("www.reddit.com", "old.reddit.com");
        const fallbackResponse = await fetch(fallbackUrl, {
          headers: {
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
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
      }

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
