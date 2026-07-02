/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@lacuna-engine/content-loader",
    "@lacuna-engine/narrative-runtime",
    "@lacuna-engine/schema",
    "@lacuna-engine/ui-kit",
    "@lacuna-engine/world-authoring",
  ],
};

export default nextConfig;
