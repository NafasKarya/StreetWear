/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  serverExternalPackages: ["@prisma/client", "bcryptjs"],

  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/uploads/:path*",
      },
    ];
  },

  images: {
    remotePatterns: [
      // OSS Alibaba Cloud - HTTPS
      {
        protocol: "https",
        hostname: "nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com",
        pathname: "/**",
      },
      // OSS Alibaba Cloud - HTTP (biar Next.js allow juga)
      {
        protocol: "http",
        hostname: "nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com",
        pathname: "/**",
      },
      // (Opsional) Storage lokal
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/storage/**",
      },
      // (Opsional) Storage di subdomain
      {
        protocol: "https",
        hostname: "carbonku.nafaskarya.my.id",
        pathname: "/storage/**",
      },
          {
      protocol: "https",
      hostname: "nafaskarya-bucket.oss-ap-southeast-5.aliyuncs.com",
      pathname: "/images/**",
    },
    ],
  },
};

module.exports = nextConfig;
