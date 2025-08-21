/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: "/uploads/:path*" },
    ];
  },
};
module.exports = nextConfig;
