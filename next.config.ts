import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    serverActions: {
      // Admin image uploads (several photos per submit) exceed the 1 MB default.
      // Note: Vercel enforces its own 4.5 MB cap; photos are compressed in the browser to stay under it.
      bodySizeLimit: "40mb",
    },
  },
  // Drizzle migrations are read from disk at runtime, so ship them with the server bundle.
  outputFileTracingIncludes: {
    "/*": ["./drizzle/**/*"],
  },
};

export default nextConfig;
