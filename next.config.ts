import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
    images: { //27:10 we hve to allow the Assets.coingecko.com endpoint to be able to display images
        remotePatterns: [
            {
                protocol: "https",
                hostname: "assets.coingecko.com",
            }, {//57:15
                protocol: "https",
                hostname: "coin-images.coingecko.com",
            },
        ]
    }
};

export default nextConfig;
