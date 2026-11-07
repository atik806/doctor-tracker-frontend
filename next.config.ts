import type { NextConfig } from "next";

/*
 * API_URL empty → the mock API in src/app/api answers.
 * API_URL set   → every /api/* request is forwarded to the Express backend instead.
 * "beforeFiles" makes the rewrite win over the mock route handlers.
 */
const apiUrl = process.env.API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Hide the floating "N" dev badge (it covered the sidebar in screenshots).
  devIndicators: false,
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    if (!apiUrl) return [];
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
