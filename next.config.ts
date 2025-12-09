import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
      },
      {
        protocol: "https",
        hostname: "*.redd.it",
      },
      {
        protocol: "https",
        hostname: "styles.redditmedia.com",
      },
    ],
  },
};

export default nextConfig;
