import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  
  // Output standalone untuk Docker optimization
  output: "standalone",
};

export default nextConfig;
