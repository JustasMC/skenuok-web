import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/generatorius",
        destination: "/irankiai/seo-generatorius",
        permanent: true,
      },
      {
        source: "/tools/generator",
        destination: "/irankiai/seo-generatorius",
        permanent: true,
      },
    ];
  },
  /** Leisti atidaryti dev serverį per LAN IP (kitaip Next.js blokuoja `/_next/*` ir „lūžta“ UI). */
  allowedDevOrigins: [
    "http://192.168.0.104:3000",
    "http://192.168.0.104:3001",
    "http://10.186.228.129:3000",
    "http://10.186.228.129:3001",
  ],
};

export default withBundleAnalyzer(nextConfig);
