/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: [
      "@libsql/client",
      "libsql",
      "@prisma/adapter-libsql",
      "@libsql/isomorphic-fetch",
      "@libsql/isomorphic-ws",
    ],
  },
};

module.exports = nextConfig;
