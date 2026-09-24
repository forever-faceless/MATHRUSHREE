import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  experimental: {
    serverActions: {
      // Admin image uploads (several photos per submit) exceed the 1 MB default.
      bodySizeLimit: "40mb",
    },
  },
  // Drizzle migrations are read from disk at runtime, so ship them with the server bundle.
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
  },
};

export default nextConfig;
