import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* other config options  */

  async headers() {
    return [
      {
        source: "/(.*)", 
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:8080/api/:path*",
      },
    ];
  },
};

export default nextConfig;