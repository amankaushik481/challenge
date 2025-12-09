import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Music Player for Reddit | Stream Music from Subreddits",
  description:
    "A free and open-source streaming music web player using data from Reddit. Browse subreddits, discover new music, and create playlists from YouTube links.",
  keywords: [
    "reddit",
    "music player",
    "streaming",
    "youtube",
    "subreddit",
    "playlist",
    "free music",
  ],
  authors: [{ name: "Reddit Music Player" }],
  openGraph: {
    title: "Music Player for Reddit",
    description: "Stream music from your favorite subreddits",
    type: "website",
    siteName: "Reddit Music Player",
  },
  twitter: {
    card: "summary_large_image",
    title: "Music Player for Reddit",
    description: "Stream music from your favorite subreddits",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gradient-mesh min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}

