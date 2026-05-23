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
};

export default nextConfig;