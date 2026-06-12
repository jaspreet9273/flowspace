// ============================================================
// NEXT.JS CONFIG
//
// LEARNING: This file controls compiler options, image domains,
// environment variables exposure, redirects, headers, etc.
// ============================================================

import type { NextConfig } from "next";

const config: NextConfig = {
  // Strict mode: double-invokes render in dev to catch side effects
  reactStrictMode: true,

  // Image optimization — allow external image domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  typedRoutes: false,

  // Custom response headers for security
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default config;
