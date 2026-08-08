import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Settings and editor forms submit uploaded images as base64 data URLs
      // (a 5MB file becomes ~6.7MB of base64). The default 1MB server-action
      // body limit would reject those submissions with a fetch error.
      bodySizeLimit: "8mb",
    },
  },
  images: {
    // Serve resized, format-optimized images (WebP/AVIF) via sharp, which is
    // already a dependency. Uploaded files under /uploads are served by a
    // route handler, so the optimizer only applies to public/ and remote src.
    unoptimized: false,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "itdsuenr.com",
      },
    ],
  },
};

export default nextConfig;
