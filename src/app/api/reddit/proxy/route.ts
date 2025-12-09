import { NextRequest, NextResponse } from "next/server";

const REDDIT_BASE_URL = "https://www.reddit.com";

// Generic proxy for any Reddit API endpoint
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json(
      { error: "Path is required" },
      { status: 400 }
    );
  }

  // Ensure path starts with /
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${REDDIT_BASE_URL}${cleanPath}`;

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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error proxying Reddit request:", error);
    return NextResponse.json(
      { error: "Failed to proxy Reddit request" },
      { status: 500 }
    );
  }
}

