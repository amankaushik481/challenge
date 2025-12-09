import { Metadata } from "next";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ subreddit: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subreddit } = await params;
  const subredditName = subreddit.replace(/\+/g, ", ");

  return {
    title: `r/${subredditName} | Music Player for Reddit`,
    description: `Listen to music from r/${subredditName} on Reddit Music Player. Stream YouTube videos and discover new music from the ${subredditName} subreddit.`,
    openGraph: {
      title: `r/${subredditName} | Music Player for Reddit`,
      description: `Listen to music from r/${subredditName}`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `r/${subredditName} | Music Player for Reddit`,
      description: `Listen to music from r/${subredditName}`,
    },
  };
}

export default async function SubredditPage({ params }: Props) {
  const { subreddit } = await params;
  
  // Redirect to home with subreddit parameter
  // The client-side will pick up the subreddit and load it
  redirect(`/?subreddit=${encodeURIComponent(subreddit)}`);
}

