/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@lacuna-engine/content-loader",
    "@lacuna-engine/schema",
    "@lacuna-engine/ui-kit"
  ]
};

export default nextConfig;
