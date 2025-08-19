import { NextConfig } from "next";
import nextPwa from "next-pwa";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ulnpskypjlycjtpxrdua.supabase.co",
      },
    ],
  },
};

const config = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig as Parameters<typeof nextPwa>);

export default config;
