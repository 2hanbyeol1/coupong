import { NextConfig } from "next";
import nextPwa from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
};

const config = nextPwa({
  dest: "public",
  register: true,
  skipWaiting: true,
})(nextConfig as Parameters<typeof nextPwa>);

export default config;
