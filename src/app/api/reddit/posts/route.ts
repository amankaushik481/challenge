import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

// More realistic User-Agent to avoid 403 errors
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

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
        "User-Agent": USER_AGENT,
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      cache: "no-store", // Don't cache to avoid stale data issues
    });

    if (!response.ok) {
      // If 403, try with different approach
      if (response.status === 403) {
        // Try the old.reddit.com endpoint as fallback
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
          return NextResponse.json(data);
        }
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
