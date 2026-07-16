import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Legacy WordPress uploads live at `https://nivro.co.uk/wp-content/uploads/…`
 * but that domain now serves this Next.js app after the DNS switch. Set
 * `WP_IMAGE_UPSTREAM` to the host that still has those files (a WP backup
 * host, an R2 bucket, a Blob store, etc.) and every `/wp-content/uploads/*`
 * request is transparently proxied there.
 */
const wpImageUpstream = process.env.WP_IMAGE_UPSTREAM?.replace(/\/+$/, "");

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "fastly.picsum.photos",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "loremflickr.com",
      },
      {
        protocol: "https",
        hostname: "pbplus.eu",
      },
      {
        protocol: "https",
        hostname: "*.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "cdnbigbuy.com",
      },
      {
        protocol: "https",
        hostname: "*.cdnbigbuy.com",
      },
      {
        protocol: "https",
        hostname: "nivro.co.uk",
      },
      {
        protocol: "https",
        hostname: "*.nivro.co.uk",
      },
      {
        protocol: "https",
        hostname: "images.nivro.co.uk",
      },
    ],
  },
  async rewrites() {
    if (!wpImageUpstream) return [];
    return [
      {
        source: "/wp-content/uploads/:path*",
        destination: `${wpImageUpstream}/wp-content/uploads/:path*`,
      },
    ];
  },
  headers: async () => [
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
  ],
};

export default withNextIntl(nextConfig);
