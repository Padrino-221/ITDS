import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/staff-panel",
          "/learn/account",
          "/learn/author",
          "/learn/review",
        ],
      },
    ],
    sitemap: "https://itdsuenr.com/sitemap.xml",
  };
}
