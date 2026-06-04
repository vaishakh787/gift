import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Move turbo configuration directly out to the root layer
  turbo: {
    root: __dirname,
  },
};

export default nextConfig;