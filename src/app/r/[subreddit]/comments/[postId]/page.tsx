import { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ subreddit: string; postId: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subreddit, postId } = await params;

  return {
    title: `Post in r/${subreddit} | Music Player for Reddit`,
    description: `Listen to this post from r/${subreddit} on Reddit Music Player.`,
    openGraph: {
      title: `Post in r/${subreddit} | Music Player for Reddit`,
      description: `Listen to this post from r/${subreddit}`,
      type: "website",
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { subreddit, postId } = await params;
  
  // Redirect to home with post parameter
  redirect(`/?subreddit=${encodeURIComponent(subreddit)}&post=${encodeURIComponent(postId)}`);
}

